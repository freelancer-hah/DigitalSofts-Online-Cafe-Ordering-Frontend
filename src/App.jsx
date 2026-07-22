// frontend/src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import VoiceOrdering from './components/VoiceOrdering/VoiceOrdering';
import VisionOrder from './components/Vision/VisionOrder';
import Chatbot from './components/Chatbot/Chatbot';

// Pages
import Home from './components/pages/Home';
import Menu from './components/pages/Menu';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Cart from './components/pages/Cart';
import Checkout from './components/pages/Checkout';
import Payment from './components/pages/Payment';
import OrderTracking from './components/pages/OrderTracking';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Profile from './components/pages/Profile';
import Orders from './components/pages/Orders';

// Admin
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import KitchenBoard from './components/admin/KitchenBoard';
import MenuManagement from './components/admin/MenuManagement';
import OrderManagement from './components/admin/OrderManagement';
import UsersManagement from './components/admin/UsersManagement';
import DeliveryManagement from './components/admin/DeliveryManagement';

// Rider
import RiderLogin from './components/rider/RiderLogin';
import RiderDashboard from './components/rider/RiderDashboard';

// Customer
import DeliveryTracking from './components/customer/DeliveryTracking';

// Protected Route Components
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  if (adminOnly) {
    if (!adminToken) return <Navigate to="/admin/login" replace />;
    return children;
  }

  if (!token && !adminToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [activeWidget, setActiveWidget] = useState(null);

  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/track/:orderNumber?" element={<OrderTracking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/kitchen" element={<ProtectedRoute adminOnly><KitchenBoard /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute adminOnly><MenuManagement /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute adminOnly><OrderManagement /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly><UsersManagement /></ProtectedRoute>} />
                <Route path="/admin/deliveries" element={<ProtectedRoute adminOnly><DeliveryManagement /></ProtectedRoute>} />

                {/* Rider Routes — no wrapper, dashboard handles redirect */}
                <Route path="/rider/login" element={<RiderLogin />} />
                <Route path="/rider/dashboard" element={<RiderDashboard />} />

                {/* Customer Delivery Tracking */}
                <Route path="/track-delivery/:orderId" element={<DeliveryTracking />} />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <VoiceOrdering activeWidget={activeWidget} setActiveWidget={setActiveWidget} />
            <VisionOrder activeWidget={activeWidget} setActiveWidget={setActiveWidget} />
            <Chatbot activeWidget={activeWidget} setActiveWidget={setActiveWidget} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { background: '#363636', color: '#fff' },
                success: { duration: 3000, iconTheme: { primary: '#4ade80', secondary: '#fff' } },
                error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </div>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;