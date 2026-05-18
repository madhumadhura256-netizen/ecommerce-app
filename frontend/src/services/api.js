import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)  => api.post('/auth/register', data),
  login:          (data)  => api.post('/auth/login', data),
  getMe:          ()      => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:     ()       => api.get('/users/profile'),
  updateProfile:  (data)   => api.put('/users/profile', data),
  uploadAvatar:   (image)  => api.put('/users/avatar', { image }),
  addAddress:     (data)   => api.post('/users/addresses', data),
  updateAddress:  (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress:  (id)     => api.delete(`/users/addresses/${id}`),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:       (params) => api.get('/products', { params }),
  getById:      (id)     => api.get(`/products/${id}`),
  getCategories:()       => api.get('/products/categories'),
  addReview:    (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:       (data)   => api.post('/orders', data),
  getMyOrders:  (params) => api.get('/orders/mine', { params }),
  getById:      (id)     => api.get(`/orders/${id}`),
  cancel:       (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  pay:          (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get:    ()    => api.get('/wishlist'),
  add:    (id)  => api.post('/wishlist', { productId: id }),
  remove: (id)  => api.delete(`/wishlist/${id}`),
  clear:  ()    => api.delete('/wishlist'),
};

// ─── Location ─────────────────────────────────────────────────────────────────
export const locationAPI = {
  reverseGeocode:   (lat, lng)      => api.post('/location/reverse-geocode', { lat, lng }),
  saveLocation:     (data)          => api.post('/location/save', data),
  deliveryEstimate: (lat, lng)      => api.post('/location/delivery-estimate', { lat, lng }),
};

export default api;