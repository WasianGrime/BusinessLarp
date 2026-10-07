import { useEffect, useState } from "react";
import type { Settings } from "../types";
import { fmtMoney, fmtPct, fmtSignedMoney, trendClass } from "../lib/format";

interface Props {
  settings: Settings;
  netWorth: number;
  totalPnl: number;
  totalPnlPct: number;
  paused: boolean;
  onTogglePause: () => void;
  onOpenSettings: () => void;
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
}

export function Header({ settings, netWorth, totalPnl, totalPnlPct, paused, onTogglePause, onOpenSettings }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="header">
      <div className="brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" className="brand-bg" />
          <polyline points="4,24 11,16 16,20 23,9 28,12" fill="none" stroke="var(--up)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div className="brand-name">{settings.firm || "BusinessLarp"} <span className="brand-pro">TERMINAL PRO™</span></div>
          <div className="brand-sub">Serious trading for serious professionals*</div>
        </div>
      </div>

      <div className="header-status">
        <button className={`status-pill ${paused ? "paused" : "live"}`} onClick={onTogglePause} title={paused ? "Resume the market" : "Pause the market"}>
          <span className="dot" />
          {paused ? "MARKET PAUSED (lunch)" : "MARKET OPEN 24/7/365"}
        </button>
        <span className="clock">{now.toLocaleTimeString("en-US", { hour12: false })} EST (Extremely Serious Time)</span>
      </div>

      <div className="header-right">
        <div className="networth">
          <div className="label">Net worth</div>
          <div className="value">{fmtMoney(netWorth, settings.currency)}</div>
          <div className={`delta ${trendClass(totalPnl)}`}>
            {fmtSignedMoney(totalPnl, settings.currency)} ({fmtPct(totalPnlPct)})
          </div>
        </div>
        <button className="user-chip" onClick={onOpenSettings} title="Settings">
          <span className="avatar">{initials(settings.name)}</span>
          <span className="user-text">
            <span className="user-name">{settings.name || "Anonymous Whale"}</span>
            <span className="user-title">{settings.title}</span>
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
