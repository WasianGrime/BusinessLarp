import { useEffect, useState } from "react";
import type { MarketSpeed, Settings } from "../types";

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onResetPortfolio: (startingCash: number) => void;
  onFactoryReset: () => void;
}

const TITLES = [
  "Chief Synergy Officer",
  "VP of Vibes",
  "Senior Thought Leader",
  "Head of Circling Back",
  "Director of Moving Needles",
  "Intern (Unpaid, Visionary)",
  "Founder & CEO & CFO & Janitor",
];

const CHAOS_LABELS: [number, string][] = [
  [0.75, "Index fund energy"],
  [1.25, "Normal Tuesday"],
  [2, "Earnings season"],
  [2.6, "Someone tweeted"],
  [Infinity, "Absolutely unhinged"],
];

function chaosLabel(v: number): string {
  return CHAOS_LABELS.find(([max]) => v < max)![1];
}

export function SettingsModal({ settings, onSave, onClose, onResetPortfolio, onFactoryReset }: Props) {
  const [draft, setDraft] = useState(settings);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setDraft((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...draft, startingCash: Math.max(1000, Math.round(draft.startingCash) || 1000) });
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-head">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <fieldset>
            <legend>Your profile</legend>
            <label className="field">
              <span>Display name</span>
              <input value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={40} autoFocus />
            </label>
            <label className="field">
              <span>Job title</span>
              <input value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={50} list="title-ideas" />
              <datalist id="title-ideas">{TITLES.map((t) => <option key={t} value={t} />)}</datalist>
            </label>
            <label className="field">
              <span>Firm name (shown in the header)</span>
              <input value={draft.firm} onChange={(e) => set("firm", e.target.value)} maxLength={30} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Market</legend>
            <div className="field">
              <span>Market speed</span>
              <div className="seg seg-full">
                {(["chill", "normal", "caffeinated"] as MarketSpeed[]).map((s) => (
                  <button type="button" key={s} className={draft.speed === s ? "active" : ""} onClick={() => set("speed", s)}>
                    {s === "chill" ? "🧘 Chill" : s === "normal" ? "📈 Normal" : "☕ Caffeinated"}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Chaos level: <strong>{chaosLabel(draft.chaos)}</strong></span>
              <input type="range" min={0.5} max={3} step={0.25} value={draft.chaos} onChange={(e) => set("chaos", Number(e.target.value))} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Display</legend>
            <div className="field-pair">
              <label className="field">
                <span>Currency symbol</span>
                <select value={draft.currency} onChange={(e) => set("currency", e.target.value)}>
                  {["$", "€", "£", "¥", "₿", "🍕", "🥑"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div className="field">
                <span>Theme</span>
                <div className="seg seg-full">
                  <button type="button" className={draft.theme === "dark" ? "active" : ""} onClick={() => set("theme", "dark")}>Dark</button>
                  <button type="button" className={draft.theme === "light" ? "active" : ""} onClick={() => set("theme", "light")}>Light</button>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Danger zone</legend>
            <label className="field">
              <span>Starting cash (used when you reset your portfolio)</span>
              <input type="number" min={1000} step="any" value={draft.startingCash} onChange={(e) => set("startingCash", Number(e.target.value))} />
            </label>
            <div className="danger-actions">
              <button
                type="button"
                className="btn-ghost danger"
                onClick={() => {
                  const cash = Math.max(1000, Math.round(draft.startingCash) || 1000);
                  if (confirm(`Sell everything, forget your trades and start over with ${draft.currency}${cash.toLocaleString()}?`)) {
                    onSave({ ...draft, startingCash: cash });
                    onResetPortfolio(cash);
                    onClose();
                  }
                }}
              >
                Reset portfolio
              </button>
              <button
                type="button"
                className="btn-ghost danger"
                onClick={() => confirm("Erase all settings, IPOs, your watchlist and portfolio?") && onFactoryReset()}
              >
                Factory reset
              </button>
            </div>
          </fieldset>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save settings</button>
        </div>
      </form>
    </div>
  );
}
