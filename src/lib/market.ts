import type { Candle, Company, MarketSpeed, Quote, Spike } from "../types";
import { makeHeadline } from "../data/headlines";

export const TICKS_PER_CANDLE = 5;
export const MAX_CANDLES = 120;
const HISTORY_CANDLES = 90;
const MAX_SPIKES = 60;
/** A single-tick move at least this big (in %) is reported as a spike. */
const SPIKE_REPORT_PCT = 2.5;

export const TICK_MS: Record<MarketSpeed, number> = {
  chill: 2000,
  normal: 1000,
  caffeinated: 300,
};

export interface MarketState {
  quotes: Record<string, Quote>;
  spikes: Spike[];
}

let nextSpikeId = 1;

function gauss(): number {
  // Box–Muller transform.
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface StepResult {
  price: number;
  volume: number;
  /** Size of the news-driven jump, or 0 when there was none. */
  jump: number;
}

/** Per-tick upward drift in bull mode: roughly +0.3% per candle. */
const BULL_DRIFT = 0.0006;

function stepPrice(c: Company, price: number, anchor: number, chaos: number, bull = false): StepResult {
  // Bull mode calms the noise so the climb reads as a steady trend.
  const sigma = 0.0022 * c.volatility * chaos * (bull ? 0.6 : 1);
  // Gentle mean reversion so prices never wander off to zero or infinity.
  const revert = -0.004 * Math.log(price / anchor) + (bull ? BULL_DRIFT : 0);
  let jump = 0;
  if (Math.random() < 0.0015 * chaos) {
    const sign = Math.random() < (bull ? 0.85 : 0.5) ? 1 : -1;
    jump = sign * (0.035 + Math.random() * 0.09) * Math.min(c.volatility, 2);
  }
  const r = sigma * gauss() + revert + jump;
  const next = Math.max(price * Math.exp(r), c.basePrice * 0.01);
  const volume = Math.round(c.sharesOutstanding * 0.00001 * (0.3 + Math.random()) * (1 + Math.abs(r) * 150));
  return { price: next, volume, jump };
}

/** Builds a quote with a pre-generated chart history ending at `endPrice` (when given). */
export function initQuote(c: Company, now: number, tickMs: number, endPrice?: number): Quote {
  const candleMs = tickMs * TICKS_PER_CANDLE;
  let price = c.basePrice * (0.92 + Math.random() * 0.16);
  const candles: Candle[] = [];
  for (let i = 0; i < HISTORY_CANDLES; i++) {
    const candle: Candle = { t: now - (HISTORY_CANDLES - i) * candleMs, o: price, h: price, l: price, c: price, v: 0 };
    for (let k = 0; k < TICKS_PER_CANDLE; k++) {
      const s = stepPrice(c, price, c.basePrice, 1);
      price = s.price;
      candle.h = Math.max(candle.h, price);
      candle.l = Math.min(candle.l, price);
      candle.v += s.volume;
    }
    candle.c = price;
    candles.push(candle);
  }

  if (endPrice && endPrice > 0) {
    const k = endPrice / price;
    for (const cd of candles) {
      cd.o *= k;
      cd.h *= k;
      cd.l *= k;
      cd.c *= k;
    }
    price = endPrice;
  }

  const sessionOpen = candles[0].o;
  return {
    symbol: c.symbol,
    price,
    prevClose: sessionOpen * (1 + gauss() * 0.006),
    sessionOpen,
    sessionHigh: Math.max(...candles.map((cd) => cd.h)),
    sessionLow: Math.min(...candles.map((cd) => cd.l)),
    volume: candles.reduce((sum, cd) => sum + cd.v, 0),
    candles,
    ticksInCandle: TICKS_PER_CANDLE,
    anchor: endPrice && endPrice > 0 ? endPrice : c.basePrice,
    lastMove: 0,
  };
}

export function initMarket(companies: Company[], tickMs: number, savedPrices: Record<string, number>): MarketState {
  const now = Date.now();
  const quotes: Record<string, Quote> = {};
  for (const c of companies) quotes[c.symbol] = initQuote(c, now, tickMs, savedPrices[c.symbol]);

  // A few "earlier today" alerts so the feed isn't empty on first load.
  const spikes: Spike[] = [];
  for (let i = 0; i < 4; i++) {
    const c = companies[Math.floor(Math.random() * companies.length)];
    const pct = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 7);
    spikes.push({ id: nextSpikeId++, t: now - (i + 1) * 47_000, symbol: c.symbol, pct, headline: makeHeadline(c.name, pct >= 0) });
  }
  return { quotes, spikes };
}

export function stepMarket(state: MarketState, companies: Company[], chaos: number, tickMs: number, bull = false): MarketState {
  const now = Date.now();
  const quotes: Record<string, Quote> = {};
  const newSpikes: Spike[] = [];

  for (const c of companies) {
    const q = state.quotes[c.symbol] ?? initQuote(c, now, tickMs);
    const s = stepPrice(c, q.price, q.anchor, chaos, bull);
    const pct = ((s.price - q.price) / q.price) * 100;

    const candles = q.candles.slice();
    let ticksInCandle = q.ticksInCandle;
    if (ticksInCandle >= TICKS_PER_CANDLE) {
      candles.push({ t: now, o: q.price, h: Math.max(q.price, s.price), l: Math.min(q.price, s.price), c: s.price, v: s.volume });
      if (candles.length > MAX_CANDLES) candles.shift();
      ticksInCandle = 1;
    } else {
      const last = candles[candles.length - 1];
      candles[candles.length - 1] = {
        ...last,
        h: Math.max(last.h, s.price),
        l: Math.min(last.l, s.price),
        c: s.price,
        v: last.v + s.volume,
      };
      ticksInCandle++;
    }

    quotes[c.symbol] = {
      ...q,
      price: s.price,
      sessionHigh: Math.max(q.sessionHigh, s.price),
      sessionLow: Math.min(q.sessionLow, s.price),
      volume: q.volume + s.volume,
      candles,
      ticksInCandle,
      // In bull mode the anchor ratchets up, so gains stick after it's switched off.
      anchor: bull ? Math.max(q.anchor, s.price) : q.anchor,
      lastMove: s.price > q.price ? 1 : s.price < q.price ? -1 : 0,
    };

    if (s.jump !== 0 || Math.abs(pct) >= SPIKE_REPORT_PCT) {
      newSpikes.push({ id: nextSpikeId++, t: now, symbol: c.symbol, pct, headline: makeHeadline(c.name, pct >= 0) });
    }
  }

  return {
    quotes,
    spikes: newSpikes.length ? [...newSpikes, ...state.spikes].slice(0, MAX_SPIKES) : state.spikes,
  };
}

/** Deterministic pseudo-random "fundamentals" so a company's stats don't reshuffle every render. */
export function fakeFundamentals(c: Company) {
  let h = 0;
  for (const ch of c.symbol) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = (n: number) => ((h = (h * 1103515245 + 12345) >>> 0) % 10000) / 10000 * n;
  return {
    pe: c.kind === "crypto" ? null : 8 + r(90),
    beta: 0.4 + r(1.2) * c.volatility,
    synergy: Math.round(40 + r(60)),
    buzzwordDensity: Math.round(10 + r(89)),
    analystRating: ["Strong Vibe", "Vibe", "Hold (Emotionally)", "Circle Back", "Synergize"][Math.floor(r(5))],
    yearLow: c.basePrice * (0.55 + r(0.3)),
    yearHigh: c.basePrice * (1.15 + r(0.6)),
  };
}
