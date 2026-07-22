import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 60000, // ✅ 60 seconds for Render
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Attach the right token based on user role
api.interceptors.request.use(
  (config) => {
    // 1️⃣ Rider token (for rider routes)
    const riderToken = localStorage.getItem("riderToken");
    // 2️⃣ Admin token (for admin routes)
    const adminToken = localStorage.getItem("adminToken");
    // 3️⃣ User token (for customer routes)
    const token = localStorage.getItem("token");

    // ✅ Priority: riderToken > adminToken > token
    // (so that rider routes use the rider token even if admin token exists)
    if (riderToken && config.url?.includes('/riders') || config.url?.includes('/deliveries/my')) {
      config.headers.Authorization = `Bearer ${riderToken}`;
      if (import.meta.env.DEV) {
        console.log(`🚴 Using rider token for: ${config.url}`);
      }
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      if (import.meta.env.DEV) {
        console.log(`🛡️ Using admin token for: ${config.url}`);
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.DEV) {
        console.log(`👤 Using user token for: ${config.url}`);
      }
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
      
      // Redirect based on the current path
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        window.location.href = "/admin/login";
      } else if (currentPath.includes('/rider')) {
        window.location.href = "/rider/login";
      } else {
        window.location.href = "/login";
      }
    }

    // 403 Forbidden – maybe the token is expired or role mismatch
    if (status === 403) {
      console.error('Access forbidden. You do not have permission.');
      // For rider routes, if forbidden, maybe the token is invalid, so clear rider token
      if (error.config?.url?.includes('/riders') || error.config?.url?.includes('/deliveries/my')) {
        localStorage.removeItem("riderToken");
        localStorage.removeItem("rider");
        if (window.location.pathname.includes('/rider')) {
          window.location.href = "/rider/login";
        }
      } else if (window.location.pathname.includes('/admin')) {
        window.location.href = "/admin/login";
      } else {
        // For general 403, just show a message (you can optionally redirect)
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