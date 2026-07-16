import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log('🛒 Cart updated:', cart.length, 'items');
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    setCart((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    console.log('🗑️ Clearing cart...');
    setCart([]);
    localStorage.removeItem('cart');
    console.log('✅ Cart cleared');
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};