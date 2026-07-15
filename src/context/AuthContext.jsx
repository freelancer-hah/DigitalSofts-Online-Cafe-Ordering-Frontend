// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminUsername = localStorage.getItem('adminUsername');
    const userToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('Auth check:', { token, adminUsername, userToken, userData });

    if (token && adminUsername) {
      // Admin is logged in
      setIsAdmin(true);
      setUser({ username: adminUsername, role: 'admin' });
      console.log('Admin logged in:', adminUsername);
    } else if (userToken && userData) {
      // Regular user is logged in
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(false);
        console.log('User logged in:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
      setIsAdmin(false);
      console.log('No user logged in');
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      // Store user token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      setIsAdmin(false);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      console.log('Admin login attempt:', { username });
      const res = await api.post('/auth/admin/login', { username, password });
      console.log('Admin login response:', res.data);
      
      // Store admin token
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUsername', res.data.username);
      
      setIsAdmin(true);
      setUser({ username: res.data.username, role: 'admin' });
      toast.success('Welcome Admin!');
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.response?.data?.message || 'Admin login failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register attempt:', { email: userData.email });
      const res = await api.post('/auth/register', userData);
      console.log('Register response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      setIsAdmin(false);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setUser(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    setUser,
    isAdmin,
    setIsAdmin,
    loading,
    login,
    adminLogin,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};