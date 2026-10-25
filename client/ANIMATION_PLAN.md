# NOVA — Homepage & Animation Plan

Premium dark fashion aesthetic: Fraunces (display) + Inter (body), black / cream / olive palette.
All motion must respect `prefers-reduced-motion` and stay 60fps (transform/opacity/clip-path only).

## ✅ Shipped (this pass)

| Area | Animation | Type |
|---|---|---|
| Announcement bar | Auto-rotate every 4s + slide-fade between messages | CSS keyframes + interval |
| Hero | Line-mask heading reveal (each line rises from behind a mask, staggered) | CSS + reveal observer |
| Hero | Scroll parallax — media drifts down, content drifts up & fades | rAF scroll handler |
| Hero | Animated "Scroll Down" pulse line | CSS keyframes |
| Feature bar | Scrolling marquee strip (editorial divider, pauses on hover) | CSS keyframes |
| New Arrivals | Product cards enter with staggered rise; image zoom + quick-add on hover | CSS + reveal observer |
| Category grid | Intro + cards staggered reveal; hover: image zoom, arrow nudge, scrim deepen | CSS + reveal observer |
| Brand story | Stats count up (50K+, 4.8/5…) when scrolled into view | rAF count-up hook |
| Brand story | Image wipe reveal (clip-path) with inner de-zoom | CSS clip-path |
| Testimonials | Auto-scroll pauses on hover/focus; card hover lift | JS refs + CSS |
| Lookbook | Intro + strip staggered reveal; hover lift + zoom | CSS + reveal observer |
| Newsletter | Copy blocks staggered reveal | CSS + reveal observer |
| Platform | Reveal system fallback for embedded webviews where IntersectionObserver/rAF never fire (rect-based sweep on scroll/resize/interval) | App.jsx |
| Hero / Lookbook / Sustainability | GSAP ScrollTrigger scroll-scrubs — hero media drift + content fade, lookbook strip drift, sustainability bg parallax (replaces rAF hero parallax) | gsap/ScrollTrigger via `utils/motion.js` |
| All homepage sections | SplitHeading — word-level mask reveals with 55ms stagger (7 section h2s) | `SplitHeading.jsx` |
| Footer | NOVA wordmark mask reveal + top-column stagger + bottom fade (all routes) | Footer.jsx + CSS |
| CTAs | Magnetic pointer-follow on 4 homepage buttons (Hero, Category, Lookbook, Brand Story) | `useMagnetic` hook |
| Marquee | Scroll-velocity boost — GSAP-driven timeScale 1→4x with scroll speed, decays back | FeatureBar.jsx |
| Category cards | Cursor-follow image parallax (±5px CSS vars) composed with hover zoom | CategoryGrid.jsx |

## 🔜 Roadmap (priority order)

### P1 — High impact, low risk
1. ~~**GSAP ScrollTrigger section scrubs**~~ ✅ shipped
2. ~~**Split-text headings everywhere**~~ ✅ shipped (homepage h2s; inner pages next)
3. ~~**Footer reveal**~~ ✅ shipped
4. ~~**Magnetic buttons**~~ ✅ shipped

### P2 — Medium effort
5. **Lookbook drag-to-scroll** — pointer-drag with momentum on the strip; snap to cards. Or convert strip to a GSAP horizontal-scroll pinned section.
6. **Page transitions** — hash-route change: quick fade/slide via CSS classes on `<main>` (already has `page-arrive` animation; make exit counterpart). Later: View Transitions API where supported.
7. ~~**Marquee velocity**~~ ✅ shipped
8. **Sustainability numbers** — reuse BrandStory count-up hook for eco stats (e.g., "92% less water"). Needs new content/stats from CMS.
9. ~~**Image hover parallax on category cards**~~ ✅ shipped

### P3 — Ambitious / needs assets
10. **Hero video loop** — short 4-6s muted loop (WebM < 2MB) behind the hero with poster fallback; plays only when in viewport & motion allowed.
11. **Film grain overlay** — subtle animated noise texture over hero/lookbook (CSS SVG noise, opacity ~0.04).
12. **Custom cursor** — dot + trailing ring that grows over interactive elements (desktop only; keep native cursor for inputs).
13. **Product 360° view** — image sequence spinner on product page (drag to rotate).
14. **Add-to-cart flight** — product image flies to cart icon (GSAP Flip/motion path).

## Rules of thumb
- One motion idea per section; stagger everything, never move all at once.
- Durations: micro 150–250ms, reveals 600–900ms, scrubs tied to scroll.
- Easing: `--ease` (cubic-bezier(0.22, 1, 0.36, 1)) for entrances; `power2/power3` in GSAP.
- Transform/opacity/clip-path only — no layout-animating properties.
- Every animation needs a `prefers-reduced-motion` path (site-wide kill-switch already in CSS).
