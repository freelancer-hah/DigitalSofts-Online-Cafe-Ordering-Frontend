import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <nav className="bg-brand-700 text-white sticky top-0 z-20 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">
          🍽️ Spice Corner
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="hover:text-brand-100">
            Menu
          </Link>
          <Link to="/track" className="hover:text-brand-100">
            Track Order
          </Link>
          <Link to="/cart" className="relative hover:text-brand-100">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-brand-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/login"
            className="text-xs bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded-full"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
