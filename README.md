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

## Chrome extension

The app also ships as a Chrome extension. Click its toolbar icon, or press **Alt+Shift+B**, to open the terminal in its own tab. If the tab is already open, it switches to it instead. The extension asks for no permissions.

```bash
npm run build:extension   # builds into dist-extension/
```

To install it:

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and pick the `dist-extension` folder.
3. Pin it from the puzzle-piece menu so the icon stays in the toolbar.

This works in any Chromium browser (Chrome, Edge, Brave, Arc). To publish it on the Chrome Web Store, zip the *contents* of `dist-extension/` and upload the zip in the developer dashboard. You can change the shortcut at `chrome://extensions/shortcuts`.

The extension's files live in `extension/`: the manifest, the background script that opens the tab, and the icons.

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
