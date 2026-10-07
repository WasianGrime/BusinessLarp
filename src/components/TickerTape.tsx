import type { Company, Quote } from "../types";
import { fmtPct, fmtPrice, pctChange, trendClass } from "../lib/format";

interface Props {
  companies: Company[];
  quotes: Record<string, Quote>;
  currency: string;
  onSelect: (symbol: string) => void;
}

export function TickerTape({ companies, quotes, currency, onSelect }: Props) {
  const items = companies
    .map((c) => quotes[c.symbol])
    .filter((q): q is Quote => !!q)
    .map((q) => {
      const pct = pctChange(q.prevClose, q.price);
      return (
        <button key={q.symbol} className="tape-item" onClick={() => onSelect(q.symbol)}>
          <span className="tape-sym">{q.symbol}</span>
          <span>{fmtPrice(q.price, currency)}</span>
          <span className={trendClass(pct)}>{pct >= 0 ? "▲" : "▼"} {fmtPct(pct)}</span>
        </button>
      );
    });

  // The list is rendered twice so the CSS marquee can loop seamlessly.
  return (
    <div className="tape" aria-label="Ticker tape">
      <div className="tape-track" style={{ animationDuration: `${Math.max(items.length * 4, 30)}s` }}>
        <div className="tape-group">{items}</div>
        <div className="tape-group" aria-hidden="true">{items}</div>
      </div>
    </div>
  );
}
