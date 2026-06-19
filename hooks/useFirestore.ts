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
  limit,
  startAfter,
  orderBy,
  or,
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

export const isProductAvailable = (p: any) => {
  const stock = p.stock ?? 99;
  const hasMRP = p.price && p.price > 0;
  return stock > 0 && hasMRP;
};

export const useProducts = (category?: string, fetchLimit?: number, filterOutUnavailable: boolean = true) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      
      let constraints: any[] = [];
      if (category) {
        constraints.push(
          or(
            where('category', 'array-contains', category),
            where('category', '==', category)
          )
        );
      } else {
        constraints.push(orderBy('name'));
      }
      
      if (fetchLimit) {
        // Fetch up to 1000 items from Firestore if we are filtering client-side
        // so that we don't accidentally return 0 items if the first N items are out of stock.
        constraints.push(limit(filterOutUnavailable ? 1000 : fetchLimit));
      }

      const q = query(productsRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      let finalData = data;
      if (filterOutUnavailable) {
        finalData = data.filter(isProductAvailable);
      }
      
      setProducts(finalData);
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
      if (fetchLimit && snapshot.docs.length < fetchLimit) {
        setHasMore(false);
      }
      setLoading(false);
    } catch (err) {
      console.error("🔥 FIRESTORE FETCH ERROR:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    
    try {
      setLoadingMore(true);
      const productsRef = collection(db, 'products');
      
      let constraints: any[] = [];
      if (category) {
        constraints.push(
          or(
            where('category', 'array-contains', category),
            where('category', '==', category)
          )
        );
      } else {
        constraints.push(orderBy('name'));
      }
      
      constraints.push(startAfter(lastVisible));
      if (fetchLimit) {
        constraints.push(limit(filterOutUnavailable ? 1000 : fetchLimit));
      }

      const q = query(productsRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      let finalData = data;
      if (filterOutUnavailable) {
        finalData = data.filter(isProductAvailable);
      }
      
      if (finalData.length > 0) {
        setProducts((prev) => [...prev, ...finalData]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
      
      if (fetchLimit && snapshot.docs.length < fetchLimit) {
        setHasMore(false);
      }
      setLoadingMore(false);
    } catch (err) {
      console.error("🔥 FIRESTORE LOAD MORE ERROR:", err);
      setError(err instanceof Error ? err.message : 'Failed to load more products');
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return { products, loading, loadingMore, hasMore, error, refresh: fetchProducts, loadMore };
};

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = doc(db, 'products', productId);
        const snapshot = await import('firebase/firestore').then((m) => m.getDoc(productDoc));
        
        if (snapshot.exists()) {
          setProduct({
            id: snapshot.id,
            ...snapshot.data(),
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

// ============================================
// DOCTORS HOOKS (Health Consultants)
// ============================================

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  whatsapp: string;
  imageUrl: string;
  available: boolean;
  experience: string;
  rating: number;
}

export const useDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef, where('available', '==', true));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];
        // Sort by rating descending
        data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setDoctors(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
      setLoading(false);
    }
  }, [user?.id]);

  return { doctors, loading, error };
};
