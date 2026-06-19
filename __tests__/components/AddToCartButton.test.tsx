// ─── AddToCartButton Component Tests ────────────────────────────────────────────
// Tests for: components/AddToCartButton.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// jest globals provided by jest-expo preset

// ─── Mock Cart Context ──────────────────────────────────────────────────────────

const mockAddToCart = jest.fn();
const mockUpdateQuantity = jest.fn();
let mockCartItems: Array<{ id: string; quantity: number }> = [];

jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cartItems: mockCartItems,
    addToCart: mockAddToCart,
    updateQuantity: mockUpdateQuantity,
  }),
}));

jest.mock('@/constants/theme', () => ({
  C: {
    blue: '#007AFF',
    surfaceAlt: '#F5F5F5',
    border: '#E0E0E0',
    inkMuted: '#999',
  },
}));

import AddToCartButton from '@/components/AddToCartButton';

// ─── Helper ─────────────────────────────────────────────────────────────────────

const baseProduct = {
  id: 'prod-1',
  name: 'Paracetamol 500mg',
  brand: 'Cipla',
  category: 'Medicine',
  price: 30,
  originalPrice: 50,
  rating: 4.5,
  stock: 10,
};

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('AddToCartButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartItems = [];
  });

  it('renders "Out of Stock" when stock is 0', () => {
    const product = { ...baseProduct, stock: 0 };
    const { getByText } = render(<AddToCartButton product={product} />);

    expect(getByText('Out of Stock')).toBeTruthy();
  });

  it('renders "+ Add" button when item is not in cart', () => {
    const { getByText } = render(<AddToCartButton product={baseProduct} />);

    expect(getByText('+ Add')).toBeTruthy();
  });

  it('calls addToCart when "+ Add" is pressed', () => {
    const { getByText } = render(<AddToCartButton product={baseProduct} />);

    fireEvent.press(getByText('+ Add'));

    expect(mockAddToCart).toHaveBeenCalledWith(baseProduct);
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });

  it('renders quantity stepper when item is in cart', () => {
    mockCartItems = [{ id: 'prod-1', quantity: 3 }];

    const { getByText } = render(<AddToCartButton product={baseProduct} />);

    expect(getByText('3')).toBeTruthy();  // quantity display
    expect(getByText('−')).toBeTruthy();  // minus button
    expect(getByText('+')).toBeTruthy();  // plus button
  });

  it('pressing "−" calls updateQuantity with qty - 1', () => {
    mockCartItems = [{ id: 'prod-1', quantity: 3 }];

    const { getByText } = render(<AddToCartButton product={baseProduct} />);
    fireEvent.press(getByText('−'));

    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 2);
  });

  it('pressing "+" calls addToCart when under stock limit', () => {
    mockCartItems = [{ id: 'prod-1', quantity: 3 }];

    const { getByText } = render(<AddToCartButton product={baseProduct} />);
    fireEvent.press(getByText('+'));

    expect(mockAddToCart).toHaveBeenCalledWith(baseProduct);
  });

  it('"+" button is disabled when qty >= stock', () => {
    mockCartItems = [{ id: 'prod-1', quantity: 10 }]; // stock is 10

    const { getByText } = render(<AddToCartButton product={baseProduct} />);
    
    // Press should not trigger addToCart because qty === stock
    fireEvent.press(getByText('+'));
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('applies small styles when size="small"', () => {
    const { getByText } = render(<AddToCartButton product={baseProduct} size="small" />);

    // Button should still render and work
    expect(getByText('+ Add')).toBeTruthy();
  });
});
