import { useState } from "react";
import type { Company, Holding, Quote } from "../types";
import { fmtMoney, fmtPrice, fmtShares } from "../lib/format";

interface Props {
  company: Company;
  quote: Quote;
  cash: number;
  holding?: Holding;
  currency: string;
  onTrade: (side: "buy" | "sell", shares: number) => string | null;
}

export function TradeTicket({ company, quote, cash, holding, currency, onTrade }: Props) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("10");
  const [error, setError] = useState<string | null>(null);

  const shares = Number(qty);
  const valid = Number.isFinite(shares) && shares > 0;
  const total = valid ? shares * quote.price : 0;
  const owned = holding?.shares ?? 0;
  // Crypto trades in fractions; stocks trade in whole shares.
  const maxQty = side === "buy"
    ? company.kind === "crypto" ? Math.floor((cash / quote.price) * 10000) / 10000 : Math.floor(cash / quote.price)
    : owned;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return setError("Enter a quantity greater than zero.");
    if (company.kind === "stock" && !Number.isInteger(shares)) return setError("Stocks trade in whole shares. This isn't crypto.");
    const err = onTrade(side, shares);
    setError(err);
  };

  return (
    <form className="card ticket" onSubmit={submit}>
      <div className="card-title">
        Trade {company.symbol} <span className="muted">· {fmtPrice(quote.price, currency)}</span>
      </div>
      <div className="seg seg-full">
        <button type="button" className={side === "buy" ? "active buy" : ""} onClick={() => { setSide("buy"); setError(null); }}>Buy</button>
        <button type="button" className={side === "sell" ? "active sell" : ""} onClick={() => { setSide("sell"); setError(null); }}>Sell</button>
      </div>
      <label className="field">
        <span>Quantity</span>
        <div className="input-row">
          <input
            type="number"
            min="0"
            step={company.kind === "crypto" ? "any" : "1"}
            inputMode="decimal"
            value={qty}
            onChange={(e) => { setQty(e.target.value); setError(null); }}
          />
          <button type="button" className="btn-ghost" onClick={() => setQty(String(maxQty))}>Max</button>
        </div>
      </label>
      <div className="ticket-row"><span className="muted">Estimated {side === "buy" ? "cost" : "proceeds"}</span><strong>{fmtMoney(total, currency)}</strong></div>
      <div className="ticket-row"><span className="muted">Buying power</span><span>{fmtMoney(cash, currency)}</span></div>
      <div className="ticket-row"><span className="muted">You own</span><span>{fmtShares(owned)}</span></div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className={`btn-primary ${side}`}>
        {side === "buy" ? "Buy" : "Sell"} {company.symbol}
      </button>
    </form>
  );
}
