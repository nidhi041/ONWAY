import { Product } from '@/constants/products';
import { useCart } from '@/context/CartContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  product: Product;
  size?: 'small' | 'normal';
}

export default function AddToCartButton({ product, size = 'normal' }: Props) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find((item) => item.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  const isSmall = size === 'small';

  if (qty === 0) {
    return (
      <TouchableOpacity
        style={[styles.addButton, isSmall && styles.addButtonSmall]}
        onPress={() => addToCart(product)}
        activeOpacity={0.8}
      >
        <Text style={[styles.addButtonText, isSmall && styles.addButtonTextSmall]}>Add +</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.qtyControl, isSmall && styles.qtyControlSmall]}>
      <TouchableOpacity
        style={[styles.qtyBtn, isSmall && styles.qtyBtnSmall]}
        onPress={() => updateQuantity(product.id, qty - 1)}
        activeOpacity={0.8}
      >
        <Text style={[styles.qtyBtnText, isSmall && styles.qtyBtnTextSmall]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.qtyValue, isSmall && styles.qtyValueSmall]}>{qty}</Text>
      <TouchableOpacity
        style={[styles.qtyBtn, isSmall && styles.qtyBtnSmall]}
        onPress={() => addToCart(product)}
        activeOpacity={0.8}
      >
        <Text style={[styles.qtyBtnText, isSmall && styles.qtyBtnTextSmall]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  addButtonSmall: {
    borderRadius: 6,
    paddingVertical: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButtonTextSmall: {
    fontSize: 13,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  qtyControlSmall: {
    borderRadius: 6,
  },
  qtyBtn: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnSmall: {
    paddingVertical: 6,
  },
  qtyBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  qtyBtnTextSmall: {
    fontSize: 16,
  },
  qtyValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  qtyValueSmall: {
    fontSize: 13,
    minWidth: 22,
  },
});
