# 🌾 AnnaSanthai — Farmer Market Web Portal

A complete, no-build-step web portal connecting farmers directly with buyers,
built with **HTML, CSS, JavaScript and React** (loaded via CDN + Babel, so
you can just open the file — no `npm install` needed).

## ✨ Features

- **Marketplace** — browse fresh produce by category, search by crop or village, add to basket, checkout.
- **Farmer Dashboard** — list new produce with name, category, price, unit and stock.
- **AI Price Advisor** — an on-device "AI" tool that suggests a fair price range for a new listing, based on category market baseline, seasonality and stock pressure. No API key required.
- **FarmMate AI Chat** — a real generative-AI chat assistant (bottom-right bubble) powered by **Anthropic's Claude API**, that answers questions about pricing, storage, seasonality and produce selection.
- **Cart & checkout**, **login/signup (buyer or farmer role)**, toasts, and a fully responsive, custom-designed UI — all persisted with `localStorage` so data survives a page refresh.

## 📁 Project structure

```
farmer-market-portal/
├── index.html          # entry point (loads React/Babel from CDN)
├── css/
│   └── style.css        # full design system + all component styles
├── js/
│   ├── data.js           # seed products, categories, localStorage helpers
│   ├── ai.js              # AI Price Advisor + FarmMate AI (Claude API) wrapper
│   └── app.js             # all React components + app state
└── README.md
```

## ▶️ How to run

No build tools, no npm, no server required:

1. Download/unzip the `farmer-market-portal` folder.
2. Double-click `index.html` (or right-click → "Open with" your browser).

That's it — React, ReactDOM and Babel are loaded from a CDN and the JSX is
compiled live in the browser.

> If you prefer a local server (recommended for the AI chat's `fetch` calls
> to work smoothly in some browsers), you can run:
> ```bash
> npx serve .
> ```
> or, with Python installed:
> ```bash
> python3 -m http.server 8000
> ```
> then open `http://localhost:8000`.

## 🤖 Using FarmMate AI (the Claude-powered chat)

1. Click the round chat bubble in the bottom-right corner.
2. Paste your own **Anthropic API key** (get one at https://console.anthropic.com) into the box shown — it's stored only in your browser's `localStorage`, never sent anywhere except directly to Anthropic's API.
3. Start chatting — ask about crop prices, storage tips, or what's in season.

⚠️ **Security note for real deployments:** calling `api.anthropic.com`
directly from browser JavaScript (as this demo does, for simplicity) exposes
whatever API key is used to anyone inspecting network traffic. For a real
production app, move this call to a small backend/serverless proxy that
holds the API key server-side, and have the browser call *your* backend
instead.

## 🎨 Design system

- **Colours:** Soil brown, leaf green, marigold gold, wheat cream — evoking an Indian farmers' market / harvest palette.
- **Type:** Zilla Slab (display, stamped market-signage feel) + Work Sans (body) + JetBrains Mono (prices/data).
- **Signature element:** a hand-stamped, rotated "AI Verified Price" badge on product cards that used the AI Price Advisor.

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | Hand-written CSS3 (custom properties / design tokens) |
| Logic & UI | React 18 (via CDN, JSX compiled in-browser with Babel standalone) |
| AI | Custom heuristic price model + Anthropic Claude Messages API |
| Persistence | Browser `localStorage` (no backend/database required for this demo) |

## 📌 Possible extensions

- Swap `localStorage` for a real backend (Node/Express + MongoDB or Firebase) so data is shared across devices.
- Add image upload for produce photos.
- Add order history and farmer earnings dashboard.
- Move the Claude API call behind a backend proxy for production security.
