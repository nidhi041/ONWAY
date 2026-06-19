// ─── Orders Service Tests ───────────────────────────────────────────────────────
// Tests for: services/ordersService.ts

// jest globals provided by jest-expo preset

import { setupFirestoreMocks, mockSetDoc, mockUpdateDoc, mockGetDocs, mockOnSnapshot, mockDoc, mockCollection, mockQuery, mockOrderBy } from '../mocks/firebase';

setupFirestoreMocks();

jest.mock('@/config/firebase', () => ({
  db: {},
}));

import {
  createOrder,
  fetchUserOrders,
  updateOrderStatus,
  listenToUserOrders,
  listenToOrderDetails,
} from '@/services/ordersService';

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('ordersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── createOrder ───────────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('should create an order with correct data structure', async () => {
      const cartItems = [
        {
          id: 'prod-1',
          brand: 'Cipla',
          name: 'Paracetamol',
          description: 'Pain relief',
          price: 30,
          originalPrice: 50,
          quantity: 2,
          image: 'https://img.com/med.png',
        },
      ];
      const address = { id: 'addr-1', name: 'Home', address: '123 St', phone: '9999', type: 'home' as const };
      const payment = { id: 'pay-1', type: 'upi' as const, label: 'Google Pay' };

      const orderId = await createOrder('user-123', cartItems, address, payment, 60, 10, 5);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const orderData = mockSetDoc.mock.calls[0][1] as Record<string, any>;
      expect(orderData.status).toBe('confirmed');
      expect(orderData.totalAmount).toBe(75); // 60 + 10 + 5
      expect(orderData.items).toHaveLength(1);
      expect(orderData.items[0].productId).toBe('prod-1');
      expect(orderId).toBe('order-doc-id');
    });

    it('should throw on Firestore error', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('Write failed'));

      await expect(
        createOrder('user-123', [], {} as any, {} as any, 0, 0, 0)
      ).rejects.toThrow('Write failed');
    });
  });

  // ── fetchUserOrders ───────────────────────────────────────────────────────────

  describe('fetchUserOrders', () => {
    it('should return orders sorted by createdAt desc', async () => {
      const mockDocs = [
        { id: 'order-1', data: () => ({ status: 'delivered', totalAmount: 100 }) },
        { id: 'order-2', data: () => ({ status: 'confirmed', totalAmount: 200 }) },
      ];
      mockGetDocs.mockResolvedValueOnce({
        forEach: (cb: any) => mockDocs.forEach(cb),
      });

      const orders = await fetchUserOrders('user-123');

      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(orders).toHaveLength(2);
      expect(orders[0].id).toBe('order-1');
    });
  });

  // ── updateOrderStatus ─────────────────────────────────────────────────────────

  describe('updateOrderStatus', () => {
    it('should update status with timestamp', async () => {
      await updateOrderStatus('user-123', 'order-1', 'shipped');

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'orders', 'order-1');
      const updateData = mockUpdateDoc.mock.calls[0][1] as Record<string, any>;
      expect(updateData.status).toBe('shipped');
      expect(updateData.updatedAt).toBeDefined();
    });

    it('should include notes when provided', async () => {
      await updateOrderStatus('user-123', 'order-1', 'cancelled', 'Customer requested');

      const updateData = mockUpdateDoc.mock.calls[0][1] as Record<string, any>;
      expect(updateData.notes).toBe('Customer requested');
    });

    it('should throw on error', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        updateOrderStatus('user-123', 'order-1', 'delivered')
      ).rejects.toThrow('Update failed');
    });
  });

  // ── listenToUserOrders ────────────────────────────────────────────────────────

  describe('listenToUserOrders', () => {
    it('should set up onSnapshot listener and return unsubscribe', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValueOnce(mockUnsubscribe);

      const onUpdate = jest.fn();
      const onError = jest.fn();
      const unsub = listenToUserOrders('user-123', onUpdate, onError);

      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      expect(unsub).toBe(mockUnsubscribe);
    });
  });

  // ── listenToOrderDetails ──────────────────────────────────────────────────────

  describe('listenToOrderDetails', () => {
    it('should listen to a specific order document', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValueOnce(mockUnsubscribe);

      const onUpdate = jest.fn();
      const unsub = listenToOrderDetails('user-123', 'order-1', onUpdate);

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'orders', 'order-1');
      expect(unsub).toBe(mockUnsubscribe);
    });
  });
});
