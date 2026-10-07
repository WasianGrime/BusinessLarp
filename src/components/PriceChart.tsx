import { useEffect, useId, useRef, useState } from "react";
import type { Candle } from "../types";
import { fmtCompact, fmtPrice } from "../lib/format";

export type ChartMode = "candles" | "line";

interface Props {
  candles: Candle[];
  mode: ChartMode;
  currency: string;
  /** Session reference price; the line chart is green above it and red below. */
  reference: number;
}

const AXIS_W = 72;
const TIME_H = 22;
const PAD_TOP = 12;

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
  return ticks;
}

function timeLabel(t: number): string {
  return new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function PriceChart({ candles, mode, currency, reference }: Props) {
  const [wrapRef, { w, h }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  const n = candles.length;
  const plotW = Math.max(w - AXIS_W, 0);
  const plotH = Math.max(h - TIME_H - PAD_TOP, 0);
  const volH = plotH * 0.18;
  const priceH = plotH - volH - 8;

  let lo = Infinity;
  let hi = -Infinity;
  let vMax = 0;
  for (const c of candles) {
    lo = Math.min(lo, c.l);
    hi = Math.max(hi, c.h);
    vMax = Math.max(vMax, c.v);
  }
  const pad = (hi - lo) * 0.08 || hi * 0.01 || 1;
  lo -= pad;
  hi += pad;

  const slot = n ? plotW / n : 0;
  const x = (i: number) => i * slot + slot / 2;
  const y = (p: number) => PAD_TOP + ((hi - p) / (hi - lo)) * priceH;
  const volTop = PAD_TOP + priceH + 8;
  const vy = (v: number) => volTop + volH - (vMax ? (v / vMax) * volH : 0);

  const last = candles[n - 1];
  const lineUp = last ? last.c >= reference : true;
  const ticks = niceTicks(lo, hi, 5);
  const timeEvery = Math.max(1, Math.ceil(90 / Math.max(slot, 1)));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left) / (slot || 1));
    setHover(i >= 0 && i < n ? i : null);
  };

  const hc = hover !== null ? candles[hover] : null;
  const linePath = candles.map((c, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(c.c).toFixed(1)}`).join("");

  return (
    <div className="chart" ref={wrapRef}>
      {w > 0 && h > 0 && n > 0 && (
        <svg width={w} height={h} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Price chart">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineUp ? "var(--up)" : "var(--down)"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={lineUp ? "var(--up)" : "var(--down)"} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={0} x2={plotW} y1={y(t)} y2={y(t)} className="grid" />
              {(!last || Math.abs(y(t) - y(last.c)) > 14) && (
                <text x={plotW + 8} y={y(t) + 4} className="axis">{fmtPrice(t, currency)}</text>
              )}
            </g>
          ))}

          {candles.map((c, i) =>
            i % timeEvery === 0 && x(i) > 24 && x(i) < plotW - 24 ? (
              <text key={c.t} x={x(i)} y={h - 6} className="axis" textAnchor="middle">{timeLabel(c.t)}</text>
            ) : null,
          )}

          {/* Session reference line */}
          <line x1={0} x2={plotW} y1={y(reference)} y2={y(reference)} className="ref-line" />

          {candles.map((c, i) => (
            <rect
              key={`v${c.t}`}
              x={x(i) - Math.max(slot * 0.35, 0.5)}
              width={Math.max(slot * 0.7, 1)}
              y={vy(c.v)}
              height={volTop + volH - vy(c.v)}
              className={c.c >= c.o ? "vol up" : "vol down"}
            />
          ))}

          {mode === "line" ? (
            <>
              <path d={`${linePath}L${x(n - 1)},${PAD_TOP + priceH}L${x(0)},${PAD_TOP + priceH}Z`} fill={`url(#${gradId})`} />
              <path d={linePath} className={lineUp ? "line up" : "line down"} />
            </>
          ) : (
            candles.map((c, i) => {
              const up = c.c >= c.o;
              const bw = Math.max(slot * 0.62, 1);
              const top = y(Math.max(c.o, c.c));
              return (
                <g key={c.t} className={up ? "candle up" : "candle down"}>
                  <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} />
                  <rect x={x(i) - bw / 2} width={bw} y={top} height={Math.max(y(Math.min(c.o, c.c)) - top, 1)} />
                </g>
              );
            })
          )}

          {last && (
            <g>
              <line x1={0} x2={plotW} y1={y(last.c)} y2={y(last.c)} className={lineUp ? "last-line up" : "last-line down"} />
              <rect x={plotW + 2} y={y(last.c) - 10} width={AXIS_W - 4} height={20} rx={4} className={lineUp ? "last-tag up" : "last-tag down"} />
              <text x={plotW + 8} y={y(last.c) + 4} className="last-text">{fmtPrice(last.c, currency)}</text>
            </g>
          )}

          {hc && hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD_TOP} y2={volTop + volH} className="crosshair" />
              <g transform={`translate(${Math.min(x(hover) + 12, plotW - 170)}, ${PAD_TOP + 4})`}>
                <rect width={160} height={92} rx={8} className="tooltip-bg" />
                <text x={10} y={18} className="tooltip-title">{timeLabel(hc.t)}</text>
                <text x={10} y={36} className="tooltip">O {fmtPrice(hc.o, currency)}</text>
                <text x={10} y={50} className="tooltip">H {fmtPrice(hc.h, currency)}</text>
                <text x={10} y={64} className="tooltip">L {fmtPrice(hc.l, currency)}</text>
                <text x={10} y={78} className="tooltip">C {fmtPrice(hc.c, currency)} · Vol {fmtCompact(hc.v)}</text>
              </g>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
