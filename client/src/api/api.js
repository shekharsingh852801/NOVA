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
