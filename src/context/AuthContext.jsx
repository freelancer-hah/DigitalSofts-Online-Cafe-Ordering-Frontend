// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ✅ Helper to read initial state from localStorage
const getInitialAuthState = () => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUsername = localStorage.getItem('adminUsername');
  const userToken = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const riderToken = localStorage.getItem('riderToken');
  const riderData = localStorage.getItem('rider');

  // Priority: admin > rider > customer
  if (adminToken && adminUsername) {
    return {
      user: { username: adminUsername, role: 'admin' },
      isAdmin: true,
      isRider: false,
      loading: false,
    };
  }
  if (riderData) {
    try {
      const parsedRider = JSON.parse(riderData);
      return {
        user: parsedRider,
        isAdmin: false,
        isRider: true,
        loading: false,
      };
    } catch (e) {
      // invalid rider data, clear it
      localStorage.removeItem('rider');
      localStorage.removeItem('riderToken');
    }
  }
  if (userToken && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      return {
        user: parsedUser,
        isAdmin: false,
        isRider: false,
        loading: false,
      };
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  // Default: no user
  return {
    user: null,
    isAdmin: false,
    isRider: false,
    loading: false,
  };
};

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuthState();
  const [user, setUser] = useState(initial.user);
  const [loading, setLoading] = useState(initial.loading);
  const [isAdmin, setIsAdmin] = useState(initial.isAdmin);
  const [isRider, setIsRider] = useState(initial.isRider);

  // Sync with localStorage changes (in case of login from another tab, not needed here)
  useEffect(() => {
    // After mount, check again (in case of changes during render)
    const current = getInitialAuthState();
    setUser(current.user);
    setIsAdmin(current.isAdmin);
    setIsRider(current.isRider);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'rider') {
        localStorage.setItem('riderToken', token);
        localStorage.setItem('rider', JSON.stringify(user));
      }

      setUser(user);
      setIsAdmin(user.role === 'admin');
      setIsRider(user.role === 'rider');
      toast.success('Welcome back!');
      return { success: true, token, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const res = await api.post('/auth/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUsername', res.data.username);
      setIsAdmin(true);
      setIsRider(false);
      setUser({ username: res.data.username, role: 'admin' });
      toast.success('Welcome Admin!');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Admin login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAdmin(false);
      setIsRider(false);
      toast.success('Account created!');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('riderToken');
    localStorage.removeItem('rider');
    setUser(null);
    setIsAdmin(false);
    setIsRider(false);
    toast.success('Logged out');
  };

  const value = {
    user,
    setUser,
    isAdmin,
    isRider,
    loading,
    login,
    adminLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};