/** Price precision that stays readable for both $3,210 and $0.0419 assets. */
function priceDigits(n: number): number {
  const a = Math.abs(n);
  if (a === 0 || a >= 1) return 2;
  if (a >= 0.1) return 3;
  return 4;
}

export function fmtPrice(n: number, currency: string): string {
  const d = priceDigits(n);
  return `${n < 0 ? "-" : ""}${currency}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function fmtMoney(n: number, currency: string): string {
  return `${n < 0 ? "-" : ""}${currency}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtSignedMoney(n: number, currency: string): string {
  return `${n >= 0 ? "+" : "-"}${fmtMoney(Math.abs(n), currency)}`;
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function fmtCompact(n: number): string {
  return n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
}

export function fmtShares(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function fmtTime(t: number): string {
  return new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function pctChange(from: number, to: number): number {
  return from === 0 ? 0 : ((to - from) / from) * 100;
}

export function trendClass(n: number): string {
  return n > 0 ? "up" : n < 0 ? "down" : "flat";
}
