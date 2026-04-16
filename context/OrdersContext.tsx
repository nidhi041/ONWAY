import { auth } from '@/config/firebase';
import { listenToUserOrders, Order, updateOrderStatus } from '@/services/ordersService';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Listen to auth changes and set up orders listener
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        setIsLoggingOut(false);
        setIsLoading(true);
        try {
          // Set up real-time listener for orders
          unsubscribeOrders = listenToUserOrders(
            user.uid,
            (fetchedOrders) => {
              setOrders(fetchedOrders);
              setIsLoading(false);
              setError(null);
            },
            (error) => {
              // Suppress listener errors during logout
              if (!isLoggingOut) {
                console.error('Orders listener error:', error);
                setError(error.message);
              }
              setIsLoading(false);
            }
          );
        } catch (err: any) {
          console.error('Error setting up orders listener:', err);
          if (!isLoggingOut) {
            setError(err.message);
          }
          setIsLoading(false);
        }
      } else {
        // User logged out - clean up listener
        setIsLoggingOut(true);
        if (unsubscribeOrders) {
          unsubscribeOrders();
          unsubscribeOrders = null;
        }
        setOrders([]);
        setError(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [isLoggingOut]);

  const refreshOrders = async () => {
    // Orders auto-refresh via real-time listener, but this can be used for manual refresh
    // In practice, the listener will handle updates automatically
    setIsLoading(true);
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    try {
      await updateOrderStatus(currentUser.uid, orderId, status);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, isLoading, error, refreshOrders, updateStatus }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
};
