// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCartIcon, 
  UserCircleIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
  HomeIcon,
  ClipboardListIcon,
  UsersIcon,
  CakeIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/outline';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  // Normal user navigation links
  const userNavLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/track', label: 'Track Order' },
  ];

  // Admin navigation links
  const adminNavLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <ChartBarIcon className="h-5 w-5" /> },
    { to: '/admin/menu', label: 'Menu Management', icon: <CakeIcon className="h-5 w-5" /> },
    { to: '/admin/kitchen', label: 'Kitchen Board', icon: <ClipboardListIcon className="h-5 w-5" /> },
    { to: '/admin/orders', label: 'Order Management', icon: <ClipboardListIcon className="h-5 w-5" /> },
    { to: '/admin/users', label: 'User Management', icon: <UsersIcon className="h-5 w-5" /> },
  ];

  // Admin dropdown links
  const adminDropdownLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <ChartBarIcon className="h-4 w-4" /> },
    { to: '/admin/menu', label: 'Menu Management', icon: <CakeIcon className="h-4 w-4" /> },
    { to: '/admin/kitchen', label: 'Kitchen Board', icon: <ClipboardListIcon className="h-4 w-4" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ClipboardListIcon className="h-4 w-4" /> },
    { to: '/admin/users', label: 'Users', icon: <UsersIcon className="h-4 w-4" /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-orange-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="text-2xl font-bold">🍽️ Spice Corner</span>
            {isAdmin && (
              <span className="text-xs bg-yellow-500 text-gray-900 px-2 py-0.5 rounded-full font-medium">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show different nav links based on user role */}
            {isAdmin ? (
              // ADMIN NAVIGATION
              <>
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-white/90 hover:text-white hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              // USER NAVIGATION
              <>
                {userNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-white/90 hover:text-white hover:scale-105 transition-all duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* Cart - Only for normal users */}
            {!isAdmin && (
              <Link to="/cart" className="relative">
                <ShoppingCartIcon className="h-6 w-6 hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Section */}
            {isAdmin ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    Admin Panel
                    <span className="ml-1">▼</span>
                  </button>
                  
                  {isAdminMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                      {adminDropdownLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsAdminMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-3"
                        >
                          <span className="text-orange-500">{link.icon}</span>
                          {link.label}
                        </Link>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                      >
                        <CogIcon className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Admin Login Button - For normal users
              <Link
                to="/admin/login"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Admin
              </Link>
            )}

            {/* User Section - Only for normal users */}
            {!isAdmin && (
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <Link to="/profile" className="hover:text-white/80">
                      <UserCircleIcon className="h-6 w-6" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="hover:text-white/80 font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full font-medium transition"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-orange-700 px-4 py-3 space-y-2">
          {isAdmin ? (
            // ADMIN MOBILE MENU
            <>
              <div className="border-b border-white/20 pb-2">
                <p className="text-xs text-yellow-300 px-3 py-1 flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Admin Panel
                </p>
              </div>
              {adminNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/10 transition flex items-center gap-3"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-300 hover:text-red-200 py-2.5 px-3 rounded-lg hover:bg-white/10 transition mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            // USER MOBILE MENU
            <>
              {userNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition"
                >
                  {link.label}
                </Link>
              ))}
              
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition"
              >
                Cart ({cartCount})
              </Link>

              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-yellow-500 text-gray-900 py-2 px-3 rounded-lg font-medium hover:bg-yellow-600 transition"
              >
                Admin Login
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-white text-orange-600 py-2 px-3 rounded-lg font-medium hover:bg-orange-50 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;