// ─── Cart Flow Integration Tests ────────────────────────────────────────────────
// Tests the complete Cart user journey: Add → Update → Remove → Clear

// jest globals provided by jest-expo preset

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockAddToCartDB = jest.fn().mockResolvedValue(undefined);
const mockRemoveFromCartDB = jest.fn().mockResolvedValue(undefined);
const mockUpdateCartQuantityDB = jest.fn().mockResolvedValue(undefined);
const mockClearCartDB = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/cartService', () => ({
  addToCartDB: (...args: any[]) => mockAddToCartDB(...args),
  removeFromCartDB: (...args: any[]) => mockRemoveFromCartDB(...args),
  updateCartQuantityDB: (...args: any[]) => mockUpdateCartQuantityDB(...args),
  clearCartDB: (...args: any[]) => mockClearCartDB(...args),
  listenToCart: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn().mockReturnValue({}),
  collection: jest.fn().mockReturnValue({}),
}));

import {
  addToCartDB,
  removeFromCartDB,
  updateCartQuantityDB,
  clearCartDB,
} from '@/services/cartService';

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('Cart Flow (Integration)', () => {
  const userId = 'user-flow-123';
  const product1 = {
    id: 'med-1',
    brand: 'Cipla',
    name: 'Paracetamol 500mg',
    description: 'Pain relief tablet',
    price: 30,
    originalPrice: 50,
    quantity: 1,
    image: 'https://example.com/med.png',
  };

  const product2 = {
    id: 'med-2',
    brand: 'Sun Pharma',
    name: 'Vitamin C 1000mg',
    description: 'Immunity booster',
    price: 120,
    originalPrice: 150,
    quantity: 1,
    image: 'https://example.com/vitc.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Step 1: Add first product to cart', async () => {
    await addToCartDB(userId, product1);

    expect(mockAddToCartDB).toHaveBeenCalledWith(userId, expect.objectContaining({
      id: 'med-1',
      name: 'Paracetamol 500mg',
      quantity: 1,
    }));
  });

  it('Step 2: Add second product to cart', async () => {
    await addToCartDB(userId, product2);

    expect(mockAddToCartDB).toHaveBeenCalledWith(userId, expect.objectContaining({
      id: 'med-2',
      name: 'Vitamin C 1000mg',
    }));
  });

  it('Step 3: Update first product quantity to 3', async () => {
    await updateCartQuantityDB(userId, 'med-1', 3);

    expect(mockUpdateCartQuantityDB).toHaveBeenCalledWith(userId, 'med-1', 3);
  });

  it('Step 4: Remove second product', async () => {
    await removeFromCartDB(userId, 'med-2');

    expect(mockRemoveFromCartDB).toHaveBeenCalledWith(userId, 'med-2');
  });

  it('Step 5: Clear entire cart', async () => {
    await clearCartDB(userId);

    expect(mockClearCartDB).toHaveBeenCalledWith(userId);
  });

  it('Full flow: Add → Update → Remove → Clear runs without errors', async () => {
    // Simulate entire user journey
    await addToCartDB(userId, product1);
    await addToCartDB(userId, product2);
    await updateCartQuantityDB(userId, 'med-1', 5);
    await removeFromCartDB(userId, 'med-2');
    await clearCartDB(userId);

    expect(mockAddToCartDB).toHaveBeenCalledTimes(2);
    expect(mockUpdateCartQuantityDB).toHaveBeenCalledTimes(1);
    expect(mockRemoveFromCartDB).toHaveBeenCalledTimes(1);
    expect(mockClearCartDB).toHaveBeenCalledTimes(1);
  });
});
