# NOVA — MERN Stack Landing Page

A pixel-close recreation of the NOVA streetwear landing page, built as a full MERN
(MongoDB, Express, React, Node.js) application.

- `client/` — React 18 + Vite frontend. Pure CSS (no framework), fully responsive,
  fetches New Arrivals + testimonials from the API and falls back to local data if
  the API is unreachable so the UI never breaks in a demo.
- `server/` — Express + Mongoose backend. REST API for products, testimonials and
  newsletter subscriptions, with validation and MongoDB persistence.

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
│   ├── config/db.js
│   ├── models/              # Product, Subscriber, Testimonial
│   ├── routes/              # /api/products, /api/newsletter, /api/testimonials
│   ├── seed/                # sample data + seed script
│   └── server.js
└── README.md
```

## Improvements over a static clone

While matching the original design exactly, a few professional upgrades were added:

1. **Real data layer** — New Arrivals and Testimonials are served from MongoDB via
   Express instead of being hard-coded, so a store owner can edit products in the
   database and the page updates automatically.
2. **Newsletter capture that actually works** — both the mid-page and footer email
   forms POST to `/api/newsletter/subscribe`, validate the email, prevent duplicate
   signups, and show inline success/error states.
3. **Graceful degradation** — if the API is down, the client silently falls back to
   bundled sample data instead of showing a broken page.
4. **Accessibility** — semantic landmarks, alt text on every image, visible focus
   states, `prefers-reduced-motion` support, labelled form controls.
5. **Responsive down to 360px** — the original design is desktop-only; this build
   adds a mobile nav, stacked grids, and fluid type sizing.
6. **Mongoose schema validation** on the backend (unique emails, price/type
   constraints) instead of trusting client input.

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # set MONGODB_URI if not using the default local URI
npm install
npm run seed               # populates products + testimonials
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env       # set VITE_API_URL if backend isn't on :5000
npm install
npm run dev                 # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173 — the page fetches New Arrivals + Testimonials from the
API, and the two newsletter forms write real subscriber documents to MongoDB.

### 3. Production build

```bash
cd client && npm run build   # outputs client/dist, served by any static host
```

## Notes on assets

All photography is placeholder imagery (Picsum/UI Avatars) so the project runs
immediately with no external asset pipeline. Swap the URLs in
`client/src/data/*.js` and `server/seed/seedData.js` for real product photography
before shipping to production.
