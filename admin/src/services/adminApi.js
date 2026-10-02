const API_BASE = 'http://localhost:5001/api';

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchAdminOverview() {
  const [products, orders] = await Promise.all([
    request('/products'),
    request('/orders/track'),
  ]).catch(() => [[], []]);

  return {
    products: Array.isArray(products) ? products : [],
    orders: Array.isArray(orders) ? orders : [],
  };
}

export async function fetchProducts() {
  return request('/products');
}

export async function fetchHealth() {
  return request('/health/ready');
}
