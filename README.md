# BusinessLarp Terminal

A gag website dressed up as a serious day trading platform. Every company, price and headline is fake, and the market never closes.

## Features

- **Live fake market.** About 20 parody companies and coins (Synergy Dynamics, Circle Back Holdings, VibeCoin…) tick in real time, with random spikes caused by breaking corporate nonsense.
- **Chart.** Candlestick or line view with volume, crosshair tooltip and session reference line.
- **Stats sidebar.** Key stats for the selected asset, including a P/E ratio of "vibes" for crypto, a synergy score and buzzword density. Also shows spike alerts and top movers.
- **Right panel.**
  - Trade ticket for buying and selling.
  - Watchlist with sparklines.
  - Portfolio with P&L and trade history.
  - **Add companies**: search every listing, or IPO your own company.
- **Settings.** Name, job title, firm name, market speed, chaos level, currency symbol (including 🍕), dark or light theme, portfolio reset.
- **Saved in the browser.** Settings, watchlist, portfolio, IPOs and last prices are kept in `localStorage`. Nothing ever leaves the browser.

## Development

Requires Node 20+.

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

The build is fully static, and asset paths are relative, so `dist/` can be hosted anywhere (GitHub Pages, Netlify, Vercel, …).

## Project layout

```
src/
  App.tsx                      app state: settings, portfolio, watchlist, IPOs
  data/companies.ts            the fake company universe
  data/headlines.ts            spike headline generator
  lib/market.ts                price simulation (random walk + news spikes)
  lib/format.ts                number/price formatting
  hooks/useMarket.ts           runs the market tick loop
  hooks/usePersistentState.ts  localStorage-backed state
  components/                  header, ticker tape, chart, panels, settings modal
```

*Not financial advice. Not finance. Not advice.*
