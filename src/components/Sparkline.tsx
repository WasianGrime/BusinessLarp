import type { Candle } from "../types";

interface Props {
  candles: Candle[];
  up: boolean;
  width?: number;
  height?: number;
  points?: number;
}

export function Sparkline({ candles, up, width = 72, height = 24, points = 40 }: Props) {
  const data = candles.slice(-points).map((c) => c.c);
  if (data.length < 2) return <svg width={width} height={height} />;
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const span = hi - lo || 1;
  const d = data
    .map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - lo) / span) * (height - 4)).toFixed(1)}`)
    .join("");
  return (
    <svg width={width} height={height} className="sparkline" aria-hidden="true">
      <path d={d} className={up ? "line up" : "line down"} />
    </svg>
  );
}
