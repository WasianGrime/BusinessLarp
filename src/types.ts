export type AssetKind = "stock" | "crypto";

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  kind: AssetKind;
  tagline: string;
  /** Price the simulation gently pulls back toward. */
  basePrice: number;
  /** Relative volatility; 1 is "normal", crypto is much higher. */
  volatility: number;
  /** Fake shares outstanding, used for the market cap stat. */
  sharesOutstanding: number;
  /** True for companies the user IPO'd themselves. */
  custom?: boolean;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  sessionOpen: number;
  sessionHigh: number;
  sessionLow: number;
  volume: number;
  candles: Candle[];
  /** Ticks folded into the newest candle so far. */
  ticksInCandle: number;
  /** Level the price is gently pulled back toward. */
  anchor: number;
  /** Direction of the most recent tick, for flashing prices. */
  lastMove: -1 | 0 | 1;
}

export interface Spike {
  id: number;
  t: number;
  symbol: string;
  pct: number;
  headline: string;
}

export interface Holding {
  shares: number;
  avgCost: number;
}

export interface Trade {
  id: number;
  t: number;
  symbol: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
}

export interface Portfolio {
  cash: number;
  startingCash: number;
  holdings: Record<string, Holding>;
  trades: Trade[];
}

export type MarketSpeed = "chill" | "normal" | "caffeinated";
export type Theme = "dark" | "light";

export interface Settings {
  name: string;
  title: string;
  firm: string;
  currency: string;
  startingCash: number;
  speed: MarketSpeed;
  /** Volatility multiplier, 0.5 (calm) to 3 (unhinged). */
  chaos: number;
  theme: Theme;
  /** Slow, steady upward drift across the whole market. */
  bullMode: boolean;
}
