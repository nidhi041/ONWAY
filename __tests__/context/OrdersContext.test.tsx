// ─── OrdersContext Tests ────────────────────────────────────────────────────────
// Tests for: context/OrdersContext.tsx

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
// jest globals provided by jest-expo preset

// ─── Mock Services ──────────────────────────────────────────────────────────────

const mockListenToUserOrders = jest.fn().mockReturnValue(jest.fn());
const mockUpdateOrderStatus = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/ordersService', () => ({
  listenToUserOrders: (...args: any[]) => mockListenToUserOrders(...args),
  updateOrderStatus: (...args: any[]) => mockUpdateOrderStatus(...args),
}));

// ─── Mock Firebase Auth ─────────────────────────────────────────────────────────

let authCallback: ((user: any) => void) | null = null;

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: any, cb: any) => {
    authCallback = cb;
    cb(null);
    return jest.fn();
  },
}));

jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}));

import { OrdersProvider, useOrders } from '@/context/OrdersContext';

// ─── Wrapper ────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OrdersProvider>{children}</OrdersProvider>
);

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('OrdersContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authCallback = null;
  });

  it('starts with empty orders', () => {
    const { result } = renderHook(() => useOrders(), { wrapper });

    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets up orders listener when user authenticates', async () => {
    mockListenToUserOrders.mockImplementation((_uid: string, onUpdate: any) => {
      onUpdate([
        { id: 'ord-1', status: 'confirmed', totalAmount: 100 },
        { id: 'ord-2', status: 'delivered', totalAmount: 250 },
      ]);
      return jest.fn();
    });

    const { result } = renderHook(() => useOrders(), { wrapper });

    await act(() => {
      if (authCallback) authCallback({ uid: 'user-123' });
    });

    expect(mockListenToUserOrders).toHaveBeenCalledWith(
      'user-123',
      expect.any(Function),
      expect.any(Function)
    );
    expect(result.current.orders).toHaveLength(2);
  });

  it('clears orders on logout', async () => {
    mockListenToUserOrders.mockImplementation((_uid: string, onUpdate: any) => {
      onUpdate([{ id: 'ord-1', status: 'confirmed' }]);
      return jest.fn();
    });

    const { result } = renderHook(() => useOrders(), { wrapper });

    // Login
    await act(() => {
      if (authCallback) authCallback({ uid: 'user-123' });
    });
    expect(result.current.orders).toHaveLength(1);

    // Logout
    await act(() => {
      if (authCallback) authCallback(null);
    });
    expect(result.current.orders).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('updateStatus calls updateOrderStatus service', async () => {
    mockListenToUserOrders.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useOrders(), { wrapper });

    await act(() => {
      if (authCallback) authCallback({ uid: 'user-123' });
    });

    await act(() => result.current.updateStatus('ord-1', 'shipped'));

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('user-123', 'ord-1', 'shipped');
  });

  it('updateStatus sets error when not logged in', async () => {
    const { result } = renderHook(() => useOrders(), { wrapper });

    await act(() => result.current.updateStatus('ord-1', 'cancelled'));

    expect(result.current.error).toBe('No user logged in');
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it('refreshOrders toggles loading state', async () => {
    const { result } = renderHook(() => useOrders(), { wrapper });

    await act(() => result.current.refreshOrders());

    // After refresh completes, loading should be false
    expect(result.current.isLoading).toBe(false);
  });

  it('throws error from useOrders when used outside provider', () => {
    // This test ensures the context guard works
    expect(() => {
      const { result } = renderHook(() => useOrders());
      // Accessing result should throw
      result.current;
    }).toThrow('useOrders must be used within OrdersProvider');
  });
});
