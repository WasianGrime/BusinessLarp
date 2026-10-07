import type { Company, Holding, Quote } from "../types";
import { PriceChart, type ChartMode } from "./PriceChart";
import { fmtMoney, fmtPct, fmtPrice, fmtShares, fmtSignedMoney, pctChange, trendClass } from "../lib/format";

interface Props {
  company: Company;
  quote: Quote;
  holding?: Holding;
  currency: string;
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
}

export function ChartPanel({ company, quote, holding, currency, mode, onModeChange }: Props) {
  const change = quote.price - quote.prevClose;
  const changePct = pctChange(quote.prevClose, quote.price);
  const flash = quote.lastMove > 0 ? "flash-up" : quote.lastMove < 0 ? "flash-down" : "";

  return (
    <main className="panel chart-panel">
      <div className="chart-head">
        <div>
          <div className="asset-line">
            <span className="asset-sym">{company.symbol}</span>
            <span className="asset-name">{company.name}</span>
            <span className="tag">{company.kind === "crypto" ? "CRYPTO" : company.sector}</span>
            {company.custom && <span className="tag tag-accent">YOUR IPO</span>}
          </div>
          <div className="asset-tagline">“{company.tagline}”</div>
        </div>
        <div className="seg" role="group" aria-label="Chart type">
          <button className={mode === "candles" ? "active" : ""} onClick={() => onModeChange("candles")}>Candles</button>
          <button className={mode === "line" ? "active" : ""} onClick={() => onModeChange("line")}>Line</button>
        </div>
      </div>

      <div className="price-line">
        <span key={quote.price} className={`big-price ${flash}`}>{fmtPrice(quote.price, currency)}</span>
        <span className={`big-change ${trendClass(change)}`}>
          {change >= 0 ? "▲" : "▼"} {fmtPrice(Math.abs(change), currency)} ({fmtPct(changePct)})
        </span>
        <span className="muted">today</span>
      </div>

      <PriceChart candles={quote.candles} mode={mode} currency={currency} reference={quote.prevClose} />

      <div className="position-strip">
        {holding && holding.shares > 0 ? (
          <>
            <span>
              Your position: <strong>{fmtShares(holding.shares)}</strong> {company.kind === "crypto" ? "coins" : "shares"} @ {fmtPrice(holding.avgCost, currency)}
            </span>
            <span>Value <strong>{fmtMoney(holding.shares * quote.price, currency)}</strong></span>
            <span className={trendClass(quote.price - holding.avgCost)}>
              P&amp;L <strong>{fmtSignedMoney((quote.price - holding.avgCost) * holding.shares, currency)}</strong> ({fmtPct(pctChange(holding.avgCost, quote.price))})
            </span>
          </>
        ) : (
          <span className="muted">You don't own any {company.symbol}. Your financial advisor (a Magic 8-Ball) says: “Outlook good.”</span>
        )}
      </div>
    </main>
  );
}
