import { useState } from "react";
import type { Company, Portfolio, Quote } from "../types";
import { Sparkline } from "./Sparkline";
import { TradeTicket } from "./TradeTicket";
import { SECTORS_FOR_IPO } from "../data/companies";
import { fmtMoney, fmtPct, fmtPrice, fmtShares, fmtSignedMoney, fmtTime, pctChange, trendClass } from "../lib/format";

type Tab = "watchlist" | "portfolio" | "discover";

interface Props {
  companies: Company[];
  quotes: Record<string, Quote>;
  watchlist: string[];
  portfolio: Portfolio;
  selected: string;
  currency: string;
  onSelect: (symbol: string) => void;
  onToggleWatch: (symbol: string) => void;
  onTrade: (side: "buy" | "sell", shares: number) => string | null;
  onIpo: (ipo: { name: string; symbol: string; sector: string; tagline: string }) => string | null;
  onDelist: (symbol: string) => void;
}

function AssetRow({ company, quote, currency, active, onSelect, action }: {
  company: Company;
  quote?: Quote;
  currency: string;
  active: boolean;
  onSelect: () => void;
  action: React.ReactNode;
}) {
  const pct = quote ? pctChange(quote.prevClose, quote.price) : 0;
  return (
    <li className={`asset-row ${active ? "active" : ""}`}>
      <button className="asset-main" onClick={onSelect}>
        <span className="asset-id">
          <span className="asset-row-sym">{company.symbol}</span>
          <span className="asset-row-name">{company.name}</span>
        </span>
        {quote && <Sparkline candles={quote.candles} up={pct >= 0} />}
        <span className="asset-quote">
          <span>{quote ? fmtPrice(quote.price, currency) : "—"}</span>
          <span className={`badge ${trendClass(pct)}`}>{fmtPct(pct)}</span>
        </span>
      </button>
      {action}
    </li>
  );
}

function IpoForm({ onIpo }: { onIpo: Props["onIpo"] }) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [sector, setSector] = useState(SECTORS_FOR_IPO[0]);
  const [tagline, setTagline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onIpo({ name: name.trim(), symbol: symbol.trim().toUpperCase(), sector, tagline: tagline.trim() });
    setError(err);
    if (!err) {
      setName("");
      setSymbol("");
      setTagline("");
    }
  };

  return (
    <form className="card ipo" onSubmit={submit}>
      <div className="card-title">Take your company public 🔔</div>
      <label className="field">
        <span>Company name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Disruptive Ventures Inc." maxLength={40} />
      </label>
      <div className="field-pair">
        <label className="field">
          <span>Ticker</span>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="DSRT" maxLength={5} />
        </label>
        <label className="field">
          <span>Sector</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            {SECTORS_FOR_IPO.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Mission statement</span>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Making the world a better place, at scale." maxLength={80} />
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="btn-primary">Ring the opening bell</button>
    </form>
  );
}

export function SidePanel(props: Props) {
  const { companies, quotes, watchlist, portfolio, selected, currency, onSelect, onToggleWatch, onTrade, onIpo, onDelist } = props;
  const [tab, setTab] = useState<Tab>("watchlist");
  const [query, setQuery] = useState("");

  const bySymbol = new Map(companies.map((c) => [c.symbol, c]));
  const selectedCompany = bySymbol.get(selected);
  const selectedQuote = quotes[selected];

  const holdings = Object.entries(portfolio.holdings).filter(([s, h]) => h.shares > 0 && bySymbol.has(s));
  const holdingsValue = holdings.reduce((sum, [s, h]) => sum + h.shares * (quotes[s]?.price ?? h.avgCost), 0);
  const netWorth = portfolio.cash + holdingsValue;

  const q = query.trim().toLowerCase();
  const discover = companies.filter(
    (c) => !q || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q),
  );

  const watchBtn = (symbol: string) => {
    const watching = watchlist.includes(symbol);
    return (
      <button
        className={`icon-btn ${watching ? "remove" : "add"}`}
        onClick={() => onToggleWatch(symbol)}
        title={watching ? "Remove from watchlist" : "Add to watchlist"}
        aria-label={watching ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      >
        {watching ? "×" : "+"}
      </button>
    );
  };

  return (
    <aside className="panel right-panel">
      {selectedCompany && selectedQuote && (
        <TradeTicket
          key={selected}
          company={selectedCompany}
          quote={selectedQuote}
          cash={portfolio.cash}
          holding={portfolio.holdings[selected]}
          currency={currency}
          onTrade={onTrade}
        />
      )}

      <div className="tabs" role="tablist">
        {(["watchlist", "portfolio", "discover"] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t === "watchlist" ? `Watchlist (${watchlist.length})` : t === "portfolio" ? `Portfolio (${holdings.length})` : "Add companies"}
          </button>
        ))}
      </div>

      {tab === "watchlist" && (
        watchlist.length === 0 ? (
          <div className="empty">Your watchlist is empty. Head to <button className="link" onClick={() => setTab("discover")}>Add companies</button> to find some synergy.</div>
        ) : (
          <ul className="asset-list">
            {watchlist.map((s) => {
              const c = bySymbol.get(s);
              return c ? (
                <AssetRow key={s} company={c} quote={quotes[s]} currency={currency} active={s === selected} onSelect={() => onSelect(s)} action={watchBtn(s)} />
              ) : null;
            })}
          </ul>
        )
      )}

      {tab === "portfolio" && (
        <>
          <div className="card summary">
            <div className="summary-row"><span className="muted">Cash</span><strong>{fmtMoney(portfolio.cash, currency)}</strong></div>
            <div className="summary-row"><span className="muted">Holdings</span><strong>{fmtMoney(holdingsValue, currency)}</strong></div>
            <div className="summary-row"><span className="muted">Net worth</span><strong>{fmtMoney(netWorth, currency)}</strong></div>
            <div className="summary-row">
              <span className="muted">All-time P&amp;L</span>
              <strong className={trendClass(netWorth - portfolio.startingCash)}>
                {fmtSignedMoney(netWorth - portfolio.startingCash, currency)} ({fmtPct(pctChange(portfolio.startingCash, netWorth))})
              </strong>
            </div>
          </div>
          {holdings.length === 0 ? (
            <div className="empty">No positions yet. Buy something; it's not real money. Probably.</div>
          ) : (
            <ul className="asset-list">
              {holdings.map(([s, h]) => {
                const quote = quotes[s];
                const price = quote?.price ?? h.avgCost;
                const pnl = (price - h.avgCost) * h.shares;
                return (
                  <li key={s} className={`holding ${s === selected ? "active" : ""}`}>
                    <button className="holding-main" onClick={() => onSelect(s)}>
                      <div className="holding-top">
                        <span className="asset-row-sym">{s}</span>
                        <span>{fmtMoney(h.shares * price, currency)}</span>
                      </div>
                      <div className="holding-sub">
                        <span className="muted">{fmtShares(h.shares)} @ {fmtPrice(h.avgCost, currency)}</span>
                        <span className={trendClass(pnl)}>{fmtSignedMoney(pnl, currency)} ({fmtPct(pctChange(h.avgCost, price))})</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {portfolio.trades.length > 0 && (
            <div className="card">
              <div className="card-title">Recent trades</div>
              <ul className="trades">
                {portfolio.trades.slice(0, 12).map((t) => (
                  <li key={t.id}>
                    <span className={`badge ${t.side === "buy" ? "up" : "down"}`}>{t.side.toUpperCase()}</span>
                    <span>{fmtShares(t.shares)} {t.symbol}</span>
                    <span className="muted">@ {fmtPrice(t.price, currency)}</span>
                    <span className="muted trade-time">{fmtTime(t.t)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {tab === "discover" && (
        <>
          <input className="search" placeholder="Search companies, tickers, sectors…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <ul className="asset-list">
            {discover.map((c) => (
              <AssetRow
                key={c.symbol}
                company={c}
                quote={quotes[c.symbol]}
                currency={currency}
                active={c.symbol === selected}
                onSelect={() => onSelect(c.symbol)}
                action={
                  <div className="row-actions">
                    {watchBtn(c.symbol)}
                    {c.custom && (
                      <button className="icon-btn remove" title="Delist company" aria-label={`Delist ${c.symbol}`} onClick={() => onDelist(c.symbol)}>🗑</button>
                    )}
                  </div>
                }
              />
            ))}
            {discover.length === 0 && <li className="empty">No matches. Maybe IPO it yourself?</li>}
          </ul>
          <IpoForm onIpo={onIpo} />
        </>
      )}
    </aside>
  );
}
