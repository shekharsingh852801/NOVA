// Config-driven analytics: GA4 + Meta Pixel load only when IDs are set in
// admin settings (server /api/settings/public). All events no-op otherwise.

let initialized = false;
let ga4Id = null;
let metaPixelId = null;

function injectGa4(id) {
  if (document.querySelector(`script[src*="gtag/js?id=${id}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: true });
}

function injectMetaPixel(id) {
  if (document.querySelector("#meta-pixel-script")) return;
  const script = document.createElement("script");
  script.id = "meta-pixel-script";
  script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
  document.head.appendChild(script);
}

export async function initAnalytics() {
  if (initialized) return;
  initialized = true;
  try {
    const { fetchPublicSettings } = await import("../api/api.js");
    const settings = await fetchPublicSettings();
    ga4Id = settings.ga4_id || null;
    metaPixelId = settings.meta_pixel_id || null;
    if (ga4Id) injectGa4(ga4Id);
    if (metaPixelId) injectMetaPixel(metaPixelId);
  } catch {
    // Analytics is optional — never block the storefront
  }
}

export function track(event, payload = {}) {
  try {
    if (ga4Id && typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }
    if (metaPixelId && typeof window.fbq === "function") {
      const value = payload.value ?? 0;
      const currency = payload.currency ?? "USD";
      const contents = payload.items?.map((item) => ({ id: item.item_id, quantity: item.quantity }));
      window.fbq("trackCustom", event, { ...payload, value, currency, contents });
    }
  } catch {
    // Never let tracking break the UX
  }
}

export function trackViewProduct(product) {
  track("view_item", {
    items: [{ item_id: product.slug, item_name: product.name, price: product.price }],
    value: product.price,
    currency: "USD",
  });
}

export function trackAddToCart(product, quantity = 1) {
  track("add_to_cart", {
    items: [{ item_id: product.slug, item_name: product.name, price: product.price, quantity }],
    value: product.price * quantity,
    currency: "USD",
  });
}

export function trackBeginCheckout(subtotal, items = []) {
  track("begin_checkout", {
    items: items.map((line) => ({ item_id: line.product?.slug, item_name: line.product?.name, price: line.product?.price, quantity: line.quantity })),
    value: subtotal,
    currency: "USD",
  });
}

export function trackPurchase(order) {
  track("purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "USD",
    items: (order.lines || []).map((line) => ({ item_id: line.product?.slug, item_name: line.product?.name, price: line.product?.price, quantity: line.quantity })),
  });
}
