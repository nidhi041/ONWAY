import { db } from '@/config/firebase';
import { CartItem } from '@/context/CartContext';
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Timestamp,
    Unsubscribe,
    updateDoc,
} from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: 'home' | 'work';
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'cards' | 'cod' | 'netbanking';
  label: string;
}

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryTime?: number; // in minutes
  estimatedDelivery?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

/**
 * Create a new order from cart items
 */
export const createOrder = async (
  userId: string,
  cartItems: CartItem[],
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  subtotal: number,
  deliveryFee: number = 0,
  tax: number
): Promise<string> => {
  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const orderDocRef = doc(ordersRef);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      brand: item.brand,
      quantity: item.quantity,
      price: item.price,
      imageUrl: typeof item.image === 'string' ? item.image : undefined,
    }));

    const totalAmount = subtotal + deliveryFee + tax;

    const orderData: Omit<Order, 'id'> = {
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      status: 'confirmed',
      deliveryTime: 10, // Default 10 minutes
      estimatedDelivery: new Date(Date.now() + 10 * 60000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(orderDocRef, orderData);
    console.log('Order created successfully:', orderDocRef.id);
    return orderDocRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders for a user (latest first)
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersCollectionRef = collection(db, 'users', userId, 'orders');
    const ordersQuery = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(ordersQuery);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get single order details
 */
export const fetchOrderDetails = async (userId: string, orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const snapshot = await import('firebase/firestore').then((module) =>
      module.getDoc(orderRef)
    );
    if (!snapshot.exists()) {
      return null;
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (notes) {
      updateData.notes = notes;
    }
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for user's orders
 * Returns unsubscribe function
 */
export const listenToUserOrders = (
  userId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const ordersCollectionRef = collection(db, 'users', userId, 'orders');
    const ordersQuery = query(ordersCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          } as Order);
        });
        onUpdate(orders);
      },
      (error) => {
        console.error('Error listening to orders:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for a specific order
 */
export const listenToOrderDetails = (
  userId: string,
  orderId: string,
  onUpdate: (order: Order | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate({
            id: snapshot.id,
            ...snapshot.data(),
          } as Order);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error('Error listening to order details:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up order listener:', error);
    throw error;
  }
};
