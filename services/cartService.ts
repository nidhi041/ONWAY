import { db } from '@/config/firebase';
import { CartItem } from '@/context/CartContext';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    setDoc,
    Unsubscribe,
    updateDoc
} from 'firebase/firestore';

/**
 * Add or update a product in the user's cart
 * Path: /users/{userId}/cart/{productId}
 */
export const addToCartDB = async (
  userId: string,
  product: CartItem
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'users', userId, 'cart', product.id);
    
    // Filter out undefined/null values to prevent Firestore errors
    const cleanedProduct: Record<string, any> = {};
    Object.keys(product).forEach((key) => {
      if (product[key as keyof CartItem] !== undefined && product[key as keyof CartItem] !== null) {
        cleanedProduct[key] = product[key as keyof CartItem];
      }
    });
    
    await setDoc(cartItemRef, {
      ...cleanedProduct,
      addedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Remove a product from the user's cart
 */
export const removeFromCartDB = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'users', userId, 'cart', productId);
    await deleteDoc(cartItemRef);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Update quantity of a product in cart
 */
export const updateCartQuantityDB = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  try {
    const cartItemRef = doc(db, 'users', userId, 'cart', productId);
    await updateDoc(cartItemRef, {
      quantity,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

/**
 * Get all cart items for a user
 */
export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartCollectionRef = collection(db, 'users', userId, 'cart');
    const querySnapshot = await getDocs(cartCollectionRef);
    const items: CartItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      } as CartItem);
    });
    return items;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for cart changes
 * Returns unsubscribe function
 */
export const listenToCart = (
  userId: string,
  onUpdate: (items: CartItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const cartCollectionRef = collection(db, 'users', userId, 'cart');

    const unsubscribe = onSnapshot(
      cartCollectionRef,
      (querySnapshot) => {
        const items: CartItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          } as CartItem);
        });
        onUpdate(items);
      },
      (error) => {
        console.error('Error listening to cart:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up cart listener:', error);
    throw error;
  }
};

/**
 * Clear entire cart for a user
 */
export const clearCartDB = async (userId: string): Promise<void> => {
  try {
    const cartCollectionRef = collection(db, 'users', userId, 'cart');
    const querySnapshot = await getDocs(cartCollectionRef);
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
