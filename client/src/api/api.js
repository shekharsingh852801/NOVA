const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const isApiConfigured = () => Boolean(API_URL);

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error("Newsletter signup is temporarily unavailable. Please try again later.");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export async function fetchNewArrivals() {
  return request("/products?newArrivals=true");
}

export async function fetchTestimonials() {
  return request("/testimonials");
}

export async function subscribeToNewsletter(email, source) {
  return request("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email, source }),
  });
}

export async function createOrder(order) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export async function trackOrder(orderNumber, email) {
  return request("/orders/track", {
    method: "POST",
    body: JSON.stringify({ orderNumber, email }),
  });
}

export async function createContactRequest(contact) {
  return request("/support/contact", {
    method: "POST",
    body: JSON.stringify(contact),
  });
}

export async function createBackInStockRequest(email, productSlug) {
  return request("/support/back-in-stock", {
    method: "POST",
    body: JSON.stringify({ email, productSlug }),
  });
}
