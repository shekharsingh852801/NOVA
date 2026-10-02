# NOVA — Fashion Commerce Storefront

An editorial NOVA fashion storefront built with React, Express, and SQLite. The
client includes an offline-friendly local preview; order and support persistence
are enabled when the API is configured.

- `client/` — React 18 + Vite storefront with responsive shop, product, cart,
  wishlist, checkout, tracking, collection, journal, and account views.
- `server/` — Express + SQLite REST API for products, testimonials, newsletter,
   guest orders, order lookup, contact messages, and back-in-stock requests.

## Project structure

```
nova-landing/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/api.js      # fetch wrapper + graceful fallbacks
│   │   ├── components/     # one component per section
│   │   ├── data/           # local fallback content
│   │   ├── App.jsx
│   │   ├── index.css       # design tokens + all styles
│   │   └── main.jsx
│   └── index.html
├── server/                  # Express backend
│   ├── config/db.js         # SQLite lifecycle and schema migration
│   ├── routes/              # products, newsletter, testimonials, orders, support
│   ├── seed/                # sample data + seed script
│   └── server.js
└── README.md
```

## Root workspace commands

Run dependency installation and project scripts from the repository root:

```bash
npm install
npm run seed       # first-time catalog setup
npm run dev:api    # start the API in one terminal
npm run dev        # start Vite in another terminal
npm test
npm run build
```

## Improvements over a static clone

While matching the original design exactly, a few professional upgrades were added:

1. **Editorial shopping flows** — structured product data powers discovery,
   filtering, product detail, quick view, size finder, shop-the-look, and
   complete-the-look experiences.
2. **Persistent bag and customer choices** — cart variants, wishlist, addresses,
   recently viewed items, preview reviews, and requests persist in browser storage.
3. **Server-owned orders** — when `VITE_API_URL` is configured, the server
   validates product variants and stock, calculates prices, and stores guest orders.
4. **Graceful local preview** — without an API URL, shopping and demo checkout
   remain usable; no real payment is claimed or processed.
5. **Responsive and accessible UI** — visible focus states, labelled controls,
   reduced-motion support, and desktop/tablet/mobile layouts.

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # set DATABASE_PATH if the default file location differs
npm install
npm run seed               # inserts initial products + testimonials
npm run seed -- --reset     # resets only the catalog and testimonials
npm run dev                 # starts API on http://localhost:5001
```

`CLIENT_ORIGIN` accepts a comma-separated allowlist for deployed frontends. The
SQLite file is created automatically at `server/data/nova.sqlite` by default.
`DATABASE_PATH` can select another file. `/api/health` reports liveness and
`/api/health/ready` reports SQLite readiness. Newsletter, order, and support
routes are rate-limited; request bodies are limited to 10 KB.

Run backend checks with `cd server && npm test`. They use an in-memory SQLite
database and cover successful orders, inventory rollback, tracking, and requests.

See [client/COMMERCE_PLAN.md](client/COMMERCE_PLAN.md) for the staged delivery plan
and the remaining production requirements.

### 2. Frontend

```bash
cd client
cp .env.example .env       # set VITE_API_URL to the running API's /api URL
npm install
npm run dev                 # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173. `VITE_API_URL` points to the local SQLite API to
persist checkout, tracking, contact, and back-in-stock requests. Set
`VITE_BRAND_FILM_URL` to an approved NOVA video URL to enable film playback.

## Commerce API

- `POST /api/orders` validates product slugs, sizes, colours, and quantities,
   calculates totals from SQLite, reserves stock transactionally, and creates a
   cash-on-delivery order with payment pending.
- `POST /api/orders/track` looks up an order using its number and checkout email.
- `POST /api/support/contact` and `POST /api/support/back-in-stock` validate and
   persist customer requests. Email delivery is not configured.
- Payment capture, authenticated customer accounts, tax calculation, and live
   carrier events require production providers and are not enabled in this build.

### 3. Production build

```bash
cd client && npm run build   # outputs client/dist, served by any static host
```

## Notes on assets

Photography is illustrative and loaded from Unsplash URLs. Replace these URLs in
`client/src/data/*.js` and `server/seed/seedData.js` for real product photography
before shipping to production.
