'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Added customDetails to the interface to support Catering breakdowns
export interface CartItem {
  id: number;
  nameKey: string;
  price: number;
  qty: number;
  img: string;
  customDetails?: {
    name: string;
    qty: number;
  }[];
  guestCount?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('zafran_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('zafran_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      // If the item exists and it's NOT a catering order (which has customDetails), increment qty
      // We usually treat catering packages as unique items
      if (existing && !product.customDetails) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      // Store the new item, including customDetails if they exist
      return [...prev, { 
        id: product.id, 
        nameKey: product.nameKey, 
        price: product.price, 
        img: product.img, 
        qty: product.qty || 1,
        customDetails: product.customDetails || undefined
      }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQty, 
        clearCart, 
        cartCount,
        isLoaded 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};