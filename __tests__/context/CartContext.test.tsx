// ─── CartContext Tests ──────────────────────────────────────────────────────────
// Tests for: context/CartContext.tsx

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
// jest globals provided by jest-expo preset
import { Alert } from 'react-native';

// ─── Mock Services ──────────────────────────────────────────────────────────────

const mockAddToCartDB = jest.fn().mockResolvedValue(undefined);
const mockRemoveFromCartDB = jest.fn().mockResolvedValue(undefined);
const mockUpdateCartQuantityDB = jest.fn().mockResolvedValue(undefined);
const mockClearCartDB = jest.fn().mockResolvedValue(undefined);
const mockListenToCart = jest.fn().mockReturnValue(jest.fn()); // returns unsubscribe

jest.mock('@/services/cartService', () => ({
  addToCartDB: (...args: any[]) => mockAddToCartDB(...args),
  removeFromCartDB: (...args: any[]) => mockRemoveFromCartDB(...args),
  updateCartQuantityDB: (...args: any[]) => mockUpdateCartQuantityDB(...args),
  clearCartDB: (...args: any[]) => mockClearCartDB(...args),
  listenToCart: (...args: any[]) => mockListenToCart(...args),
}));

// ─── Mock Firebase Auth ─────────────────────────────────────────────────────────

let authCallback: ((user: any) => void) | null = null;

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: any, cb: any) => {
    authCallback = cb;
    cb(null); // default: no user
    return jest.fn();
  },
}));

jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

import { CartProvider, useCart } from '@/context/CartContext';

// ─── Wrapper ────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authCallback = null;
  });

  describe('when user is NOT logged in', () => {
    it('starts with empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cartItems).toEqual([]);
    });

    it('addToCart shows login alert', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        result.current.addToCart({
          id: 'prod-1',
          name: 'Test',
          category: 'Medicine',
          price: 30,
          rating: 4.5,
        });
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Login Required',
        'Please login to add items to your cart.',
        expect.any(Array)
      );
    });

    it('removeFromCart does nothing', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        result.current.removeFromCart('prod-1');
      });

      expect(mockRemoveFromCartDB).not.toHaveBeenCalled();
    });
  });

  describe('when user IS logged in', () => {
    it('calls addToCartDB with user ID', async () => {
      // Simulate user login
      mockListenToCart.mockImplementation((_uid: string, onUpdate: any) => {
        onUpdate([]);
        return jest.fn();
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      // Simulate auth callback with logged-in user
      await act(() => {
        if (authCallback) {
          authCallback({ uid: 'user-123' });
        }
      });

      await act(() => {
        result.current.addToCart({
          id: 'prod-1',
          name: 'Paracetamol',
          category: 'Medicine',
          price: 30,
          rating: 4.5,
        });
      });

      expect(mockAddToCartDB).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ id: 'prod-1', name: 'Paracetamol' })
      );
    });

    it('removeFromCart calls removeFromCartDB', async () => {
      mockListenToCart.mockImplementation((_uid: string, onUpdate: any) => {
        onUpdate([]);
        return jest.fn();
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        if (authCallback) authCallback({ uid: 'user-123' });
      });

      await act(() => {
        result.current.removeFromCart('prod-1');
      });

      expect(mockRemoveFromCartDB).toHaveBeenCalledWith('user-123', 'prod-1');
    });

    it('updateQuantity(id, 0) removes item instead of setting to 0', async () => {
      mockListenToCart.mockImplementation((_uid: string, onUpdate: any) => {
        onUpdate([]);
        return jest.fn();
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        if (authCallback) authCallback({ uid: 'user-123' });
      });

      await act(() => {
        result.current.updateQuantity('prod-1', 0);
      });

      expect(mockRemoveFromCartDB).toHaveBeenCalledWith('user-123', 'prod-1');
      expect(mockUpdateCartQuantityDB).not.toHaveBeenCalled();
    });

    it('clearCart calls clearCartDB', async () => {
      mockListenToCart.mockImplementation((_uid: string, onUpdate: any) => {
        onUpdate([]);
        return jest.fn();
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        if (authCallback) authCallback({ uid: 'user-123' });
      });

      await act(() => {
        result.current.clearCart();
      });

      expect(mockClearCartDB).toHaveBeenCalledWith('user-123');
    });
  });

  describe('auth state changes', () => {
    it('sets up cart listener when user logs in', async () => {
      mockListenToCart.mockImplementation((_uid: string, onUpdate: any) => {
        onUpdate([{ id: 'prod-1', name: 'Item', quantity: 1, price: 30 }]);
        return jest.fn();
      });

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(() => {
        if (authCallback) authCallback({ uid: 'user-123' });
      });

      expect(mockListenToCart).toHaveBeenCalledWith(
        'user-123',
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('clears cart when user logs out', async () => {
      mockListenToCart.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useCart(), { wrapper });

      // Log in
      await act(() => {
        if (authCallback) authCallback({ uid: 'user-123' });
      });

      // Log out
      await act(() => {
        if (authCallback) authCallback(null);
      });

      expect(result.current.cartItems).toEqual([]);
    });
  });
});
