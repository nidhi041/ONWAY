// ─── Cart Service Tests ─────────────────────────────────────────────────────────
// Tests for: services/cartService.ts

// jest globals provided by jest-expo preset

import { setupFirestoreMocks, mockSetDoc, mockDeleteDoc, mockUpdateDoc, mockGetDocs, mockOnSnapshot, mockDoc, mockCollection } from '../mocks/firebase';

setupFirestoreMocks();

jest.mock('@/config/firebase', () => ({
  db: {},
}));

import {
  addToCartDB,
  removeFromCartDB,
  updateCartQuantityDB,
  fetchCartItems,
  listenToCart,
  clearCartDB,
} from '@/services/cartService';

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('cartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── addToCartDB ───────────────────────────────────────────────────────────────

  describe('addToCartDB', () => {
    it('should write cleaned product data to Firestore', async () => {
      const cartItem = {
        id: 'prod-1',
        brand: 'Cipla',
        name: 'Paracetamol',
        description: 'Pain relief',
        price: 30,
        originalPrice: 50,
        quantity: 1,
        image: 'https://img.com/med.png',
      };

      await addToCartDB('user-123', cartItem);

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'cart', 'prod-1');
      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      const writtenData = mockSetDoc.mock.calls[0][1] as Record<string, any>;
      expect(writtenData.name).toBe('Paracetamol');
      expect(writtenData.price).toBe(30);
      expect(writtenData.addedAt).toBeDefined();
      expect(writtenData.updatedAt).toBeDefined();
    });

    it('should strip undefined and null fields before writing', async () => {
      const cartItem = {
        id: 'prod-2',
        brand: 'Unknown',
        name: 'Test Product',
        description: '',
        price: 100,
        originalPrice: 100,
        quantity: 1,
        image: undefined as any,
      };

      await addToCartDB('user-123', cartItem);

      const writtenData = mockSetDoc.mock.calls[0][1] as Record<string, any>;
      // image was undefined, so it should NOT be in the written data
      expect(writtenData.image).toBeUndefined();
      // But other fields should be present
      expect(writtenData.name).toBe('Test Product');
    });

    it('should throw and propagate errors', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('Firestore write failed'));

      await expect(addToCartDB('user-123', {
        id: 'x', brand: '', name: '', description: '',
        price: 0, originalPrice: 0, quantity: 0, image: '',
      })).rejects.toThrow('Firestore write failed');
    });
  });

  // ── removeFromCartDB ──────────────────────────────────────────────────────────

  describe('removeFromCartDB', () => {
    it('should delete the correct document', async () => {
      await removeFromCartDB('user-123', 'prod-1');

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'cart', 'prod-1');
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should throw on error', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(removeFromCartDB('user-123', 'prod-1')).rejects.toThrow('Delete failed');
    });
  });

  // ── updateCartQuantityDB ──────────────────────────────────────────────────────

  describe('updateCartQuantityDB', () => {
    it('should update quantity and set updatedAt timestamp', async () => {
      await updateCartQuantityDB('user-123', 'prod-1', 5);

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'cart', 'prod-1');
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);

      const updateData = mockUpdateDoc.mock.calls[0][1] as Record<string, any>;
      expect(updateData.quantity).toBe(5);
      expect(updateData.updatedAt).toBeDefined();
    });
  });

  // ── fetchCartItems ────────────────────────────────────────────────────────────

  describe('fetchCartItems', () => {
    it('should return mapped cart items array', async () => {
      const mockDocs = [
        { id: 'prod-1', data: () => ({ name: 'Item A', price: 30, quantity: 2 }) },
        { id: 'prod-2', data: () => ({ name: 'Item B', price: 50, quantity: 1 }) },
      ];
      mockGetDocs.mockResolvedValueOnce({
        docs: mockDocs,
        forEach: (cb: any) => mockDocs.forEach(cb),
      });

      const items = await fetchCartItems('user-123');

      expect(mockCollection).toHaveBeenCalledWith({}, 'users', 'user-123', 'cart');
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('prod-1');
      expect(items[1].id).toBe('prod-2');
    });

    it('should return empty array when cart is empty', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [],
        forEach: jest.fn(),
      });

      const items = await fetchCartItems('user-123');
      expect(items).toHaveLength(0);
    });
  });

  // ── listenToCart ──────────────────────────────────────────────────────────────

  describe('listenToCart', () => {
    it('should set up onSnapshot listener and return unsubscribe', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValueOnce(mockUnsubscribe);

      const onUpdate = jest.fn();
      const onError = jest.fn();

      const unsubscribe = listenToCart('user-123', onUpdate, onError);

      expect(mockCollection).toHaveBeenCalledWith({}, 'users', 'user-123', 'cart');
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  // ── clearCartDB ───────────────────────────────────────────────────────────────

  describe('clearCartDB', () => {
    it('should delete all cart documents in parallel', async () => {
      const mockDocs = [
        { ref: { id: 'prod-1' } },
        { ref: { id: 'prod-2' } },
        { ref: { id: 'prod-3' } },
      ];
      mockGetDocs.mockResolvedValueOnce({ docs: mockDocs });

      await clearCartDB('user-123');

      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
    });

    it('should handle empty cart gracefully', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });

      await clearCartDB('user-123');

      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });
  });
});
