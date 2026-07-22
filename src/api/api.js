// frontend/src/api/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Request interceptor – correct token priority
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const riderToken = localStorage.getItem("riderToken");
    const token = localStorage.getItem("token");

    // Determine route type
    const isAdminRoute = config.url?.includes('/admin') || config.url?.includes('/riders/all');
    const isRiderRoute = config.url?.includes('/riders') || config.url?.includes('/deliveries/my');

    // Priority: admin token for admin routes, rider token for rider routes, otherwise user token
    if (isAdminRoute && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      if (import.meta.env.DEV) console.log(`🛡️ Admin token used for ${config.url}`);
    } else if (isRiderRoute && riderToken) {
      config.headers.Authorization = `Bearer ${riderToken}`;
      if (import.meta.env.DEV) console.log(`🏍️ Rider token used for ${config.url}`);
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.DEV) console.log(`👤 User token used for ${config.url}`);
    }

    if (import.meta.env.DEV) console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor – error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.log(`✅ ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`❌ API Error: ${status} - ${message}`);

    // 401 Unauthorized – clear all tokens and redirect
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("riderToken");
      localStorage.removeItem("user");
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("rider");

      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        window.location.href = "/admin/login";
      } else if (currentPath.includes('/rider')) {
        window.location.href = "/rider/login";
      } else {
        window.location.href = "/login";
      }
    }

    // 403 Forbidden – specific handling
    if (status === 403) {
      console.error('Access forbidden. You do not have permission.');
      if (error.config?.url?.includes('/riders') || error.config?.url?.includes('/deliveries/my')) {
        localStorage.removeItem("riderToken");
        localStorage.removeItem("rider");
        if (window.location.pathname.includes('/rider')) {
          window.location.href = "/rider/login";
        }
      } else if (window.location.pathname.includes('/admin')) {
        window.location.href = "/admin/login";
      } else {
        console.error('You do not have permission for this action.');
      }
    }

    if (status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    if (status === 500) {
      console.error('Server error. Please try again later.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout. Please check your connection.');
    }

    if (error.message === 'Network Error') {
      console.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// ✅ Helper methods for common API calls
export const apiHelpers = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),

  getMenu: () => api.get('/menu'),
  addMenuItem: (data) => api.post('/menu', data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),

  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderByNumber: (orderNumber, phone) =>
    api.get(`/orders/track/${orderNumber}`, { params: { phone } }),
  getOrdersByPhone: (phone) => api.get(`/orders/track/all?phone=${phone}`),
  updateOrderStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),
  markOrderAsPaid: (id, paymentId) =>
    api.post(`/orders/${id}/mark-paid`, { paymentId }),

  getDashboardStats: () => api.get('/admin/stats/dashboard'),
  getSalesStats: () => api.get('/admin/stats/sales'),
  getRecentOrders: () => api.get('/admin/orders/recent'),

  getUsers: () => api.get('/users'),
  createStaff: (data) => api.post('/users/staff', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export default api;