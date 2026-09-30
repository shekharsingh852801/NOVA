# NOVA Commerce Delivery Plan

## Experience principles

- Keep the current NOVA editorial identity: charcoal, off-white, large imagery,
  restrained transitions, and the existing homepage composition.
- Make shopping routes usable with keyboard, touch, and pointer input, and keep
  local state resilient when browser storage is unavailable.
- Keep each step visually quiet and focused; use drawers and overlays for quick
  actions, and dedicated pages for considered decisions.

## Delivery stages

### 1. Storefront foundation — implemented

- Structured catalog fields for product identity, category, images, variants,
  pricing, fit, material, care, rating, reviews, availability, and merchandising.
- Hash-routed Home, Shop, category, Sale, Collections, Product, Wishlist, Cart,
  Checkout, Success, Tracking, About, Journal, Contact, and Account views.
- Shared product cards and responsive desktop/mobile navigation with a Shop
  mega-menu and mobile full-screen menu.
- Client persistence for cart variants, wishlist, recently viewed products,
  demo orders, profile preferences, saved addresses, reviews, and requests.

### 2. Product discovery and signature experiences — implemented

- Search overlay with instant product, collection, and journal results plus
  recent and popular searches.
- Category, size, colour, price, fit, material, availability, and sorting
  controls; mobile filters use a bottom sheet.
- Product detail gallery, variant/size selection, quick view, size finder,
  complete-the-look recommendations, shop-the-look outfit, and recently viewed.
- Product rating summary, distribution, sample imagery, and locally saved
  customer reviews, clearly marked unverified.
- Persisted wishlist, back-in-stock requests, contact requests, and empty states.

### 3. Bag and order journey — implemented with local and API modes

- Slide-out bag with variant-aware quantity changes, removal, subtotal, and the
  existing $75 complimentary-shipping threshold.
- Responsive bag and four-step guest checkout with saved-address selection.
- When `VITE_API_URL` is set, the server recalculates order totals from its
  catalog, validates variants and stock, reserves inventory in a SQLite
  transaction, and supports lookup by order number plus checkout email.
- Without an API URL, checkout and tracking use browser-persisted demo orders.
- Cash-on-delivery choices only record a pending payment method; no payment is
  processed by NOVA.

### 4. Editorial and account surfaces — implemented as local content

- Collection index and cinematic collection detail pages with product edits.
- Journal index and article views, NOVA story, contact form, and account profile,
  size preference, saved-address editor, order, wishlist, and request views.
- Existing homepage sections remain in place and lead into the new store views.

### 5. Production launch requirements — not implemented

- Replace the bundled browse/search catalog with API-backed products, variants,
  stock, and pagination; validate every product image asset.
- Replace local profiles and addresses with authenticated customer accounts;
  add verified review submission, moderation, and customer-photo consent/storage.
- Add tax and region-aware shipping calculations, order request idempotency, and
  order emails. Configure SQLite backups, WAL checkpoints, and file permissions
  for the deployment environment.
- Connect a PCI-compliant payment provider and verify success, failure, refund,
  and webhook flows. Never store card details in NOVA application storage.
- Back-in-stock and contact requests persist through the API when configured;
  connect a transactional email provider to deliver and process them.
- Supply an approved NOVA brand film URL through `VITE_BRAND_FILM_URL`.
- Add analytics/consent controls, privacy/terms/shipping/returns content reviewed
  for the launch region, monitoring, rate limits, and operational alerting.
- Run API integration, accessibility, cross-browser, image performance, and
  load tests before production release.

## Acceptance checks

- Desktop, tablet, and mobile layouts have no unintended horizontal overflow.
- Search, filters, product views, variant selection, wishlist, bag quantities,
  checkout validation, success, and local order lookup work end to end.
- A production build completes without errors or browser console warnings.
- A real payment, customer account, or order is never implied by local demo data.