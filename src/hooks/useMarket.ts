import { useEffect, useRef, useState } from "react";
import type { Company } from "../types";
import { initMarket, initQuote, stepMarket, type MarketState } from "../lib/market";
import { loadJSON, saveJSON } from "./usePersistentState";

const PRICES_KEY = "prices";

/** Runs the fake market: one tick every `tickMs` until `paused`. */
export function useMarket(companies: Company[], tickMs: number, chaos: number, paused: boolean, bull: boolean): MarketState {
  const [market, setMarket] = useState<MarketState>(() =>
    initMarket(companies, tickMs, loadJSON<Record<string, number>>(PRICES_KEY) ?? {}),
  );

  // Refs let the interval read the latest values without being torn down on every change.
  const companiesRef = useRef(companies);
  const chaosRef = useRef(chaos);
  const bullRef = useRef(bull);
  const marketRef = useRef(market);
  companiesRef.current = companies;
  chaosRef.current = chaos;
  bullRef.current = bull;
  marketRef.current = market;

  // Give newly IPO'd companies a chart right away, even while the market is paused.
  useEffect(() => {
    setMarket((m) => {
      const missing = companies.filter((c) => !m.quotes[c.symbol]);
      if (!missing.length) return m;
      const now = Date.now();
      const quotes = { ...m.quotes };
      for (const c of missing) quotes[c.symbol] = initQuote(c, now, tickMs);
      return { ...m, quotes };
    });
  }, [companies, tickMs]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setMarket((m) => stepMarket(m, companiesRef.current, chaosRef.current, tickMs, bullRef.current));
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, paused]);

  // Remember the last prices so a reload doesn't wipe out (or gift) portfolio gains.
  useEffect(() => {
    const save = () => {
      const prices: Record<string, number> = {};
      for (const [symbol, q] of Object.entries(marketRef.current.quotes)) prices[symbol] = q.price;
      saveJSON(PRICES_KEY, prices);
    };
    const id = setInterval(save, 5000);
    window.addEventListener("beforeunload", save);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", save);
    };
  }, []);

  return market;
}
