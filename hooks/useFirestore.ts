import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';

// ============================================
// ADDRESS HOOKS
// ============================================

export interface Address {
  id: string;
  type: 'home' | 'work';
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const addressesRef = collection(db, 'users', user.id, 'addresses');
      const q = query(addressesRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Address[];
        setAddresses(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      setLoading(false);
    }
  }, [user?.id]);

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const addressesRef = collection(db, 'users', user.id, 'addresses');
      await addDoc(addressesRef, {
        ...address,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add address');
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const addressDoc = doc(db, 'users', user.id, 'addresses', addressId);
      await deleteDoc(addressDoc);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const addressDoc = doc(db, 'users', user.id, 'addresses', addressId);
      const { id, ...updateData } = updates;
      await updateDoc(addressDoc, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update address');
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      // Set all to false first
      for (const addr of addresses) {
        await updateDoc(doc(db, 'users', user.id, 'addresses', addr.id), {
          isDefault: false,
        });
      }
      // Set selected to true
      await updateDoc(doc(db, 'users', user.id, 'addresses', addressId), {
        isDefault: true,
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  return { addresses, loading, error, addAddress, deleteAddress, updateAddress, setDefaultAddress };
};

// ============================================
// PAYMENT METHOD HOOKS
// ============================================

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'cards' | 'netbanking';
  label: string;
  details: string;
  icon: string;
  isDefault: boolean;
}

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const paymentsRef = collection(db, 'users', user.id, 'paymentMethods');
      const q = query(paymentsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PaymentMethod[];
        setPayments(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
      setLoading(false);
    }
  }, [user?.id]);

  const addPaymentMethod = async (payment: Omit<PaymentMethod, 'id'>) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const paymentsRef = collection(db, 'users', user.id, 'paymentMethods');
      await addDoc(paymentsRef, {
        ...payment,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add payment method');
    }
  };

  const deletePaymentMethod = async (paymentId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const paymentDoc = doc(db, 'users', user.id, 'paymentMethods', paymentId);
      await deleteDoc(paymentDoc);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete payment method');
    }
  };

  const setDefaultPaymentMethod = async (paymentId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      for (const payment of payments) {
        await updateDoc(doc(db, 'users', user.id, 'paymentMethods', payment.id), {
          isDefault: false,
        });
      }
      await updateDoc(doc(db, 'users', user.id, 'paymentMethods', paymentId), {
        isDefault: true,
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to set default payment');
    }
  };

  return {
    payments,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
};

// ============================================
// ORDER HOOKS
// ============================================

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  title: string;
  price: number;
  date: string;
  time: string;
  status: 'Arrived' | 'In Transit' | 'Processing' | 'Cancelled';
  deliveryTime: number;
  items: OrderItem[];
  shippingAddress: any;
  paymentMethod: any;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  totalAmount: number;
  supportContact: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'users', user.id, 'orders');
      const q = query(ordersRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        // Sort by date descending
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setLoading(false);
    }
  }, [user?.id]);

  const createOrder = async (order: Omit<Order, 'id'>) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const ordersRef = collection(db, 'users', user.id, 'orders');
      await addDoc(ordersRef, {
        ...order,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const orderDoc = doc(db, 'users', user.id, 'orders', orderId);
      await updateDoc(orderDoc, { status });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  return { orders, loading, error, createOrder, updateOrderStatus };
};

// ============================================
// NOTIFICATION HOOKS
// ============================================

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'order_update' | 'promo' | 'system' | 'reminder';
  icon: string;
  read: boolean;
  orderId?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const notificationsRef = collection(db, 'users', user.id, 'notifications');
      const q = query(notificationsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        // Sort by date descending
        data.sort((a, b) => (b.id.localeCompare(a.id)));
        setNotifications(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const notifDoc = doc(db, 'users', user.id, 'notifications', notificationId);
      await updateDoc(notifDoc, { read: true });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const notifDoc = doc(db, 'users', user.id, 'notifications', notificationId);
      await deleteDoc(notifDoc);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  return { notifications, loading, error, markAsRead, deleteNotification };
};

// ============================================
// PRODUCTS HOOK
// ============================================

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  deliveryTime: number;
  description: string;
  warranty: string | null;
  returnDays: number;
  imageUrl: string;
  stock: number;
}

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        let q;
        
        if (category) {
          q = query(productsRef, where('category', '==', category));
        } else {
          q = query(productsRef);
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
};

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = doc(db, 'products', productId);
        const snapshot = await getDocs(collection(db, 'products'));
        const data = snapshot.docs.find(d => d.id === productId);
        
        if (data) {
          setProduct({
            id: data.id,
            ...data.data(),
          } as Product);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

// ============================================
// CART HOOKS
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice: number;
  imageUrl: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const cartRef = collection(db, 'users', user.id, 'cart');
      const q = query(cartRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CartItem[];
        setCartItems(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      setLoading(false);
    }
  }, [user?.id]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const cartRef = collection(db, 'users', user.id, 'cart');
      
      // Check if item exists
      const existing = cartItems.find(item => item.productId === product.id);
      if (existing) {
        await updateDoc(doc(cartRef, existing.id), {
          quantity: existing.quantity + quantity,
        });
      } else {
        await addDoc(cartRef, {
          productId: product.id,
          name: product.name,
          quantity,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrl: product.imageUrl,
        });
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add to cart');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const itemDoc = doc(db, 'users', user.id, 'cart', cartItemId);
      await deleteDoc(itemDoc);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove from cart');
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      const itemDoc = doc(db, 'users', user.id, 'cart', cartItemId);
      if (quantity <= 0) {
        await deleteDoc(itemDoc);
      } else {
        await updateDoc(itemDoc, { quantity });
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user?.id) throw new Error('User not authenticated');
    try {
      for (const item of cartItems) {
        await removeFromCart(item.id);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to clear cart');
    }
  };

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
};
