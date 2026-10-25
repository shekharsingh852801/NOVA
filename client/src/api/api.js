const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`).replace(/\/$/, "");

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

export async function fetchProducts(params = "") {
  return request(`/products${params}`);
}

export async function fetchNewArrivals() {
  return request("/products?newArrivals=true");
}

export async function fetchTestimonials() {
  return request("/testimonials");
}

export async function fetchHomepage() {
  return request("/homepage");
}

export async function fetchHomepagePreview(token) {
  return request(`/homepage/preview/${encodeURIComponent(token)}`);
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

export async function loginCustomer(email, password) {
  return request("/customer/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCustomer(name, email, password) {
  return request("/customer/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function syncCart(token, cart) {
  return request("/customer/auth/sync-cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ cart }),
  });
}

export async function fetchCustomerOrders(token) {
  return request("/customer/auth/orders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
}

export async function fetchCustomerReturnRequests(token) {
  return request("/returns/mine", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function createReturnRequest(token, orderId, reason, details) {
  return request("/returns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, reason, details }),
  });
}

export async function forgotPassword(email) {
  return request("/customer/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  return request("/customer/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function submitReview(productSlug, rating, comment, token) {
  return request(`/products/${productSlug}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ rating, comment }),
  });
}

export async function validateCoupon(code, subtotal, shipping) {
  return request("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal, shipping }),
  });
}

export async function fetchPublicSettings() {
  return request("/settings/public");
}

function adminOptions(token, extra = {}) {
  return {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    ...extra,
  };
}

export async function adminLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchAdminCoupons(token) {
  return request("/coupons", adminOptions(token));
}

export async function createAdminCoupon(token, coupon) {
  return request("/coupons", {
    method: "POST",
    ...adminOptions(token),
    body: JSON.stringify(coupon),
  });
}

export async function updateAdminCoupon(token, id, patch) {
  return request(`/coupons/${id}`, {
    method: "PATCH",
    ...adminOptions(token),
    body: JSON.stringify(patch),
  });
}

export async function deleteAdminCoupon(token, id) {
  return request(`/coupons/${id}`, { method: "DELETE", ...adminOptions(token) });
}

export async function saveAdminSettings(token, settings) {
  return request("/settings", {
    method: "PUT",
    ...adminOptions(token),
    body: JSON.stringify(settings),
  });
}

export async function fetchAdminCsv(path, token, filename) {
  const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
