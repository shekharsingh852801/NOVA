const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export function resolveUploadedMediaUrl(value) {
  if (typeof value !== 'string' || !value) return value;

  try {
    const apiOrigin = new URL(API_BASE).origin;
    const imageUrl = new URL(value, apiOrigin);
    if (imageUrl.pathname.startsWith('/uploads/')) {
      return `${apiOrigin}${imageUrl.pathname}${imageUrl.search}${imageUrl.hash}`;
    }
  } catch {
    return value;
  }
  return value;
}

function getAdminAuthorizationHeaders() {
  const token = localStorage.getItem('nova_admin_token');
  if (!token) {
    throw new Error('Your admin session has expired. Sign in again before uploading images.');
  }
  return { Authorization: `Bearer ${token}` };
}

async function uploadMediaTo(path, file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getAdminAuthorizationHeaders(),
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('nova_admin_token');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Upload failed: ${response.status}`);
  }
  const result = await response.json();
  return { ...result, url: resolveUploadedMediaUrl(result.url) };
}

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

  // Media
  uploadMedia: (file) => uploadMediaTo('/upload', file),
  uploadHomepageMedia: (file) => uploadMediaTo('/upload/homepage', file),

  // Orders CRUD
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),

  // Returns
  getReturnRequests: (status = '', page = 1, limit = 50) => request(`/returns/admin?page=${page}&limit=${limit}${status ? `&status=${encodeURIComponent(status)}` : ''}`),
  updateReturnRequest: (id, update) => request(`/returns/admin/${id}`, { method: 'PATCH', body: JSON.stringify(update) }),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (email) => request(`/customers/${encodeURIComponent(email)}`),
  
  // Dashboard Overview
  getOverview: () => request('/orders/overview'),
  
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  getHomepage: () => request('/homepage/admin'),
  saveHomepageDraft: (content) => request('/homepage/admin/draft', {
    method: 'PUT',
    body: JSON.stringify(content),
  }),
  publishHomepage: () => request('/homepage/admin/publish', { method: 'POST' }),
  createHomepagePreview: () => request('/homepage/admin/preview-token', { method: 'POST' }),
};
