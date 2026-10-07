import type { Company, Quote, Spike } from "../types";
import { fakeFundamentals } from "../lib/market";
import { fmtCompact, fmtPct, fmtPrice, fmtTime, pctChange, trendClass } from "../lib/format";

interface Props {
  company: Company;
  quote: Quote;
  companies: Company[];
  quotes: Record<string, Quote>;
  spikes: Spike[];
  currency: string;
  onSelect: (symbol: string) => void;
}

function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${className ?? ""}`}>{value}</div>
    </div>
  );
}

export function StatsPanel({ company, quote, companies, quotes, spikes, currency, onSelect }: Props) {
  const f = fakeFundamentals(company);
  const change = quote.price - quote.prevClose;
  const changePct = pctChange(quote.prevClose, quote.price);
  const rangePos = (quote.price - quote.sessionLow) / (quote.sessionHigh - quote.sessionLow || 1);

  const movers = companies
    .map((c) => ({ c, q: quotes[c.symbol] }))
    .filter((m): m is { c: Company; q: Quote } => !!m.q)
    .map((m) => ({ ...m, pct: pctChange(m.q.prevClose, m.q.price) }))
    .sort((a, b) => b.pct - a.pct);
  const gainers = movers.slice(0, 3);
  const losers = movers.slice(-3).reverse();

  return (
    <aside className="panel left-panel">
      <section className="card">
        <div className="card-title">Key stats · {company.symbol}</div>
        <div className="stats-grid">
          <Stat label="Change" value={`${change >= 0 ? "+" : ""}${fmtPrice(change, currency)}`} className={trendClass(change)} />
          <Stat label="Change %" value={fmtPct(changePct)} className={trendClass(changePct)} />
          <Stat label="Open" value={fmtPrice(quote.sessionOpen, currency)} />
          <Stat label="Prev close" value={fmtPrice(quote.prevClose, currency)} />
          <Stat label="Session high" value={fmtPrice(quote.sessionHigh, currency)} />
          <Stat label="Session low" value={fmtPrice(quote.sessionLow, currency)} />
          <Stat label="Volume" value={fmtCompact(quote.volume)} />
          <Stat label="Market cap" value={`${currency}${fmtCompact(quote.price * company.sharesOutstanding)}`} />
          <Stat label="P/E ratio" value={f.pe === null ? "vibes" : f.pe.toFixed(1)} />
          <Stat label="Beta" value={f.beta.toFixed(2)} />
          <Stat label="Synergy score" value={`${f.synergy}/100`} />
          <Stat label="Buzzword density" value={`${f.buzzwordDensity}%`} />
        </div>
        <div className="range">
          <div className="range-labels">
            <span>{fmtPrice(quote.sessionLow, currency)}</span>
            <span>Session range</span>
            <span>{fmtPrice(quote.sessionHigh, currency)}</span>
          </div>
          <div className="range-bar">
            <div className="range-marker" style={{ left: `${Math.min(Math.max(rangePos, 0), 1) * 100}%` }} />
          </div>
        </div>
        <div className="rating">
          Analyst consensus: <strong>{f.analystRating}</strong>
        </div>
      </section>

      <section className="card spikes-card">
        <div className="card-title">
          Spike alerts <span className="live-dot" />
        </div>
        {spikes.length === 0 ? (
          <div className="empty">Waiting for something dramatic to happen…</div>
        ) : (
          <ul className="spikes">
            {spikes.map((s) => (
              <li key={s.id}>
                <button className="spike" onClick={() => onSelect(s.symbol)}>
                  <div className="spike-top">
                    <span className="spike-sym">{s.symbol}</span>
                    <span className={`badge ${trendClass(s.pct)}`}>
                      {s.pct >= 0 ? "▲" : "▼"} {fmtPct(s.pct)}
                    </span>
                    <span className="spike-time">{fmtTime(s.t)}</span>
                  </div>
                  <div className="spike-headline">{s.headline}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <div className="card-title">Top movers</div>
        <div className="movers">
          {[...gainers, ...losers].map(({ c, q, pct }, i) => (
            <button key={`${c.symbol}-${i}`} className="mover" onClick={() => onSelect(c.symbol)}>
              <span className="mover-sym">{c.symbol}</span>
              <span className="mover-price">{fmtPrice(q.price, currency)}</span>
              <span className={`badge ${trendClass(pct)}`}>{fmtPct(pct)}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
