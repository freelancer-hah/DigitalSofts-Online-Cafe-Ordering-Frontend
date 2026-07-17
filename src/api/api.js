import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 60000, // ✅ Increased to 60 seconds for Render
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Attach tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");
    
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("user");
      localStorage.removeItem("adminUsername");
      
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 403) {
      console.error('Access forbidden. You do not have permission.');
      if (window.location.pathname.includes('/admin')) {
        window.location.href = "/admin/login";
      }
    }
    
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }
    
    if (error.response?.status === 500) {
      console.error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout. Please check your connection.');
    }
    
    if (error.message === 'Network Error') {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API calls
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