import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Company, Portfolio, Settings } from "./types";
import { COMPANIES, DEFAULT_WATCHLIST } from "./data/companies";
import { TICK_MS } from "./lib/market";
import { pctChange } from "./lib/format";
import { useMarket } from "./hooks/useMarket";
import { clearAllStorage, usePersistentState } from "./hooks/usePersistentState";
import { Header } from "./components/Header";
import { TickerTape } from "./components/TickerTape";
import { StatsPanel } from "./components/StatsPanel";
import { ChartPanel } from "./components/ChartPanel";
import { SidePanel } from "./components/SidePanel";
import { SettingsModal } from "./components/SettingsModal";
import type { ChartMode } from "./components/PriceChart";

const DEFAULT_SETTINGS: Settings = {
  name: "Alex Hustleworth",
  title: "Chief Synergy Officer",
  firm: "BusinessLarp",
  currency: "$",
  startingCash: 100_000,
  speed: "normal",
  chaos: 1,
  theme: "dark",
};

const newPortfolio = (cash: number): Portfolio => ({ cash, startingCash: cash, holdings: {}, trades: [] });

let nextTradeId = Date.now();

export default function App() {
  const [settings, setSettings] = usePersistentState<Settings>("settings", () => DEFAULT_SETTINGS, (s) => ({ ...DEFAULT_SETTINGS, ...s }));
  const [customCompanies, setCustomCompanies] = usePersistentState<Company[]>("ipos", () => []);
  const [watchlist, setWatchlist] = usePersistentState<string[]>("watchlist", () => DEFAULT_WATCHLIST);
  const [portfolio, setPortfolio] = usePersistentState<Portfolio>("portfolio", () => newPortfolio(DEFAULT_SETTINGS.startingCash));
  const [selected, setSelected] = usePersistentState<string>("selected", () => DEFAULT_WATCHLIST[0]);
  const [chartMode, setChartMode] = usePersistentState<ChartMode>("chartMode", () => "candles");
  const [paused, setPaused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const companies = useMemo(() => [...COMPANIES, ...customCompanies], [customCompanies]);
  const bySymbol = useMemo(() => new Map(companies.map((c) => [c.symbol, c])), [companies]);
  const market = useMarket(companies, TICK_MS[settings.speed], settings.chaos, paused);
  const { quotes } = market;

  const currentSymbol = bySymbol.has(selected) ? selected : companies[0].symbol;
  const company = bySymbol.get(currentSymbol)!;
  const quote = quotes[currentSymbol];

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (quote) document.title = `${company.symbol} ${settings.currency}${quote.price.toFixed(2)} · ${settings.firm || "BusinessLarp"} Terminal`;
  }, [company.symbol, quote, settings.currency, settings.firm]);

  const notify = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const holdingsValue = Object.entries(portfolio.holdings).reduce(
    (sum, [s, h]) => sum + h.shares * (quotes[s]?.price ?? h.avgCost),
    0,
  );
  const netWorth = portfolio.cash + holdingsValue;
  const totalPnl = netWorth - portfolio.startingCash;

  const trade = (side: "buy" | "sell", shares: number): string | null => {
    if (!quote) return "The market is still waking up. Try again in a sec.";
    const price = quote.price;
    const total = shares * price;
    const held = portfolio.holdings[currentSymbol] ?? { shares: 0, avgCost: 0 };

    if (side === "buy") {
      if (total > portfolio.cash + 1e-9) return "Insufficient funds. Have you tried being born rich?";
      const newShares = held.shares + shares;
      setPortfolio((p) => ({
        ...p,
        cash: p.cash - total,
        holdings: { ...p.holdings, [currentSymbol]: { shares: newShares, avgCost: (held.shares * held.avgCost + total) / newShares } },
        trades: [{ id: nextTradeId++, t: Date.now(), symbol: currentSymbol, side, shares, price }, ...p.trades].slice(0, 100),
      }));
      setWatchlist((w) => (w.includes(currentSymbol) ? w : [...w, currentSymbol]));
      notify(`Bought ${shares} ${currentSymbol}. Bold. Visionary. Possibly a mistake.`);
    } else {
      if (shares > held.shares + 1e-9) return `You only own ${held.shares} ${currentSymbol}. Short selling requires a finance degree.`;
      const remaining = held.shares - shares;
      setPortfolio((p) => {
        const holdings = { ...p.holdings };
        if (remaining <= 1e-9) delete holdings[currentSymbol];
        else holdings[currentSymbol] = { ...held, shares: remaining };
        return {
          ...p,
          cash: p.cash + total,
          holdings,
          trades: [{ id: nextTradeId++, t: Date.now(), symbol: currentSymbol, side, shares, price }, ...p.trades].slice(0, 100),
        };
      });
      const gain = (price - held.avgCost) * shares;
      notify(gain >= 0 ? `Sold ${shares} ${currentSymbol}. Secured the bag. 💰` : `Sold ${shares} ${currentSymbol}. It's called a "learning experience".`);
    }
    return null;
  };

  const toggleWatch = (symbol: string) =>
    setWatchlist((w) => (w.includes(symbol) ? w.filter((s) => s !== symbol) : [...w, symbol]));

  const ipo = ({ name, symbol, sector, tagline }: { name: string; symbol: string; sector: string; tagline: string }): string | null => {
    if (!name) return "Every unicorn needs a name.";
    if (!/^[A-Z]{1,5}$/.test(symbol)) return "Tickers are 1–5 letters.";
    if (bySymbol.has(symbol)) return `${symbol} is already taken. Try adding more vowels.`;
    const crypto = sector === "Crypto";
    const c: Company = {
      symbol,
      name,
      sector,
      kind: crypto ? "crypto" : "stock",
      tagline: tagline || "Disrupting the disruption space.",
      basePrice: crypto ? +(Math.random() * 5).toFixed(4) + 0.01 : Math.round(10 + Math.random() * 190),
      volatility: crypto ? 3 : 1.6,
      sharesOutstanding: crypto ? 1e10 : 5e8,
      custom: true,
    };
    setCustomCompanies((list) => [...list, c]);
    setWatchlist((w) => [...w, symbol]);
    setSelected(symbol);
    notify(`🔔 ${name} (${symbol}) is now publicly traded. Congratulations, you're a founder.`);
    return null;
  };

  const delist = (symbol: string) => {
    if ((portfolio.holdings[symbol]?.shares ?? 0) > 0) {
      notify(`Sell your ${symbol} position before delisting. The SEC is watching. (They aren't.)`);
      return;
    }
    setCustomCompanies((list) => list.filter((c) => c.symbol !== symbol));
    setWatchlist((w) => w.filter((s) => s !== symbol));
    if (selected === symbol) setSelected(DEFAULT_WATCHLIST[0]);
    notify(`${symbol} has been delisted. It was a great run.`);
  };

  return (
    <div className="app">
      <Header
        settings={settings}
        netWorth={netWorth}
        totalPnl={totalPnl}
        totalPnlPct={pctChange(portfolio.startingCash, netWorth)}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <TickerTape companies={companies} quotes={quotes} currency={settings.currency} onSelect={setSelected} />

      {quote ? (
        <div className="layout">
          <StatsPanel
            company={company}
            quote={quote}
            companies={companies}
            quotes={quotes}
            spikes={market.spikes}
            currency={settings.currency}
            onSelect={setSelected}
          />
          <ChartPanel
            company={company}
            quote={quote}
            holding={portfolio.holdings[currentSymbol]}
            currency={settings.currency}
            mode={chartMode}
            onModeChange={setChartMode}
          />
          <SidePanel
            companies={companies}
            quotes={quotes}
            watchlist={watchlist}
            portfolio={portfolio}
            selected={currentSymbol}
            currency={settings.currency}
            onSelect={setSelected}
            onToggleWatch={toggleWatch}
            onTrade={trade}
            onIpo={ipo}
            onDelist={delist}
          />
        </div>
      ) : (
        <div className="loading">Warming up the hamster wheel that powers the market…</div>
      )}

      <footer className="footer">
        *Not financial advice. Not finance. Not advice. All companies, prices and headlines are fake. Any resemblance to your actual job is coincidental.
      </footer>

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setSettingsOpen(false)}
          onResetPortfolio={(cash) => {
            setPortfolio(newPortfolio(cash));
            notify("Portfolio reset. Fresh start, same bad instincts.");
          }}
          onFactoryReset={() => {
            clearAllStorage();
            window.location.reload();
          }}
        />
      )}

      {toast && <div key={toast.id} className="toast" role="status">{toast.text}</div>}
    </div>
  );
}
