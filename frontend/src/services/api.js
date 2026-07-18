import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('novatech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const onAuthPage = ['/login', '/register'].some((p) => window.location.pathname.startsWith(p));
      if (!onAuthPage) {
        localStorage.removeItem('novatech_token');
        localStorage.removeItem('novatech_user');
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const formatNaira = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const formatDate = (d) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d));

export const formatDateTime = (d) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d));

export const truncate = (str, n = 80) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
};

export const discountPercent = (price, salePrice) => {
  if (!salePrice || salePrice <= 0 || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/me/password', data),
  addAddress: (data) => api.post('/auth/me/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/me/addresses/${id}`, data),
  removeAddress: (id) => api.delete(`/auth/me/addresses/${id}`),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (slug) => api.get(`/products/${slug}`),
  related: (slug) => api.get(`/products/${slug}/related`),
  featured: () => api.get('/products/featured'),
  latest: () => api.get('/products/latest'),
  brands: () => api.get('/products/brands'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  adjustStock: (id, adjustment) => api.post(`/products/${id}/stock`, { adjustment }),
};

export const categoryApi = {
  list: () => api.get('/categories'),
  get: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  mine: (params) => api.get('/orders/mine', { params }),
  get: (orderNumber) => api.get(`/orders/${orderNumber}`),
  all: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  verifyCoupon: (data) => api.post('/orders/coupon/verify', data),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (id, data) => api.post(`/cart/${id}`, data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (id) => api.post(`/wishlist/${id}`),
  remove: (id) => api.delete(`/wishlist/${id}`),
  clear: () => api.delete('/wishlist'),
};

export const reviewApi = {
  list: (productId) => api.get(`/reviews/${productId}`),
  create: (productId, data) => api.post(`/reviews/${productId}`, data),
  helpful: (id) => api.post(`/reviews/${id}/helpful`),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const bannerApi = {
  list: (placement) => api.get('/banners', { params: { placement } }),
  all: () => api.get('/banners/all'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  remove: (id) => api.delete(`/banners/${id}`),
};

export const couponApi = {
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  sales: (days) => api.get('/dashboard/sales', { params: { days } }),
  topProducts: (limit) => api.get('/dashboard/top-products', { params: { limit } }),
  categories: () => api.get('/dashboard/categories'),
  recentOrders: (limit) => api.get('/dashboard/recent-orders', { params: { limit } }),
};

export const uploadApi = {
  single: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  multiple: (files, folder = 'products') => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return api.post(`/uploads/${folder}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const userApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  toggleActive: (id) => api.put(`/users/${id}/active`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};
