import { auth } from '@/config/firebase';
import { Product } from '@/constants/products';
import { addToCartDB, clearCartDB, listenToCart, removeFromCartDB, updateCartQuantityDB } from '@/services/cartService';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  let unsubscribeCart: (() => void) | null = null;

  // Listen to auth changes and set up cart listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        setIsLoggingOut(false);
        setIsLoading(true);
        try {
          // Set up real-time listener for cart
          unsubscribeCart = listenToCart(
            user.uid,
            (items) => {
              setCartItems(items);
              setIsLoading(false);
            },
            (error) => {
              // Suppress errors during logout
              if (!isLoggingOut) {
                console.error('Cart listener error:', error);
              }
              setIsLoading(false);
            }
          );
        } catch (error) {
          console.error('Error setting up cart listener:', error);
          setIsLoading(false);
        }
      } else {
        // User logged out - clean up listener
        setIsLoggingOut(true);
        if (unsubscribeCart) {
          unsubscribeCart();
          unsubscribeCart = null;
        }
        setCartItems([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) {
        unsubscribeCart();
      }
    };
  }, [isLoggingOut]);

  const addToCart = async (product: Product) => {
    if (!currentUser) return;

    try {
      const existingItem = cartItems.find((item) => item.id === product.id);
      const cartItem: CartItem = {
        id: product.id,
        brand: product.brand || 'Unknown',
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity: existingItem ? existingItem.quantity + 1 : 1,
        image: product.image || '', // Use empty string as fallback instead of undefined
      };

      // Add to Firestore
      await addToCartDB(currentUser.uid, cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!currentUser) return;

    try {
      await removeFromCartDB(currentUser.uid, id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!currentUser || quantity < 0) return;

    try {
      if (quantity === 0) {
        await removeFromCartDB(currentUser.uid, id);
      } else {
        await updateCartQuantityDB(currentUser.uid, id, quantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;

    try {
      await clearCartDB(currentUser.uid);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
