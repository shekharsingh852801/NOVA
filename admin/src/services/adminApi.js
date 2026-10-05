const API_BASE = 'http://localhost:5001/api';

async function request(path, options = {}) {
  // Attach auth token if available
  const token = localStorage.getItem('nova_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login')) {
      // Handle unauthorized (e.g. redirect to login)
      localStorage.removeItem('nova_admin_token');
      window.location.href = '/login';
    }
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage || `Request failed: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchHealth() {
  return request('/health/ready');
}

export const adminApi = {
  // Products CRUD
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders CRUD
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (email) => request(`/customers/${encodeURIComponent(email)}`),
  
  // Dashboard Overview
  getOverview: async () => {
    const [products, orders] = await Promise.all([
      request('/products').catch(() => []),
      request('/orders').catch(() => []),
    ]);
    return {
      products: Array.isArray(products) ? products : [],
      orders: Array.isArray(orders) ? orders : [],
    };
  },
  
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
};
