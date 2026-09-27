const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
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
