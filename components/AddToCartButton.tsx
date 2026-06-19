import { Product } from '@/constants/products';
import { C } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { isProductAvailable } from '@/hooks/useFirestore';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props { product: Product; size?: 'small' | 'normal' }

export default function AddToCartButton({ product, size = 'normal' }: Props) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find(i => i.id === product.id);
  const qty = item?.quantity ?? 0;
  const sm = size === 'small';
  const stock = (product as any).stock ?? 99; // fallback to 99 if stock not defined
  const available = isProductAvailable(product);

  if (!available) {
    return (
      <View style={[s.outOfStock, sm && s.btnSm]}>
        <Text style={[s.outOfStockText, sm && s.btnTextSm]}>Out of Stock</Text>
      </View>
    );
  }

  if (qty === 0) {
    return (
      <TouchableOpacity style={[s.btn, sm && s.btnSm]} onPress={() => addToCart(product)} activeOpacity={0.82}>
        <Text style={[s.btnText, sm && s.btnTextSm]}>+ Add</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[s.row, sm && s.rowSm]}>
      <TouchableOpacity style={s.qBtn} onPress={() => updateQuantity(product.id, qty - 1)} activeOpacity={0.75} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={[s.qBtnText, sm && s.qBtnTextSm]}>−</Text>
      </TouchableOpacity>
      <Text style={[s.qVal, sm && s.qValSm]}>{qty}</Text>
      <TouchableOpacity
        style={[s.qBtn, qty >= stock && s.qBtnDisabled]}
        onPress={() => { if (qty < stock) addToCart(product); }}
        disabled={qty >= stock}
        activeOpacity={0.75}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={[s.qBtnText, sm && s.qBtnTextSm, qty >= stock && s.qBtnTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: C.blue, borderRadius: 10,
    paddingVertical: 9, alignItems: 'center', width: '100%',
  },
  btnSm: { borderRadius: 8, paddingVertical: 7 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  btnTextSm: { fontSize: 12 },

  outOfStock: {
    backgroundColor: C.surfaceAlt, borderRadius: 10,
    paddingVertical: 9, alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: C.border,
  },
  outOfStockText: { color: C.inkMuted, fontSize: 13, fontWeight: '600' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.blue, borderRadius: 10, overflow: 'hidden', width: '100%',
  },
  rowSm: { borderRadius: 8 },
  qBtn: { flex: 1, paddingVertical: 9, justifyContent: 'center', alignItems: 'center' },
  qBtnDisabled: { opacity: 0.4 },
  qBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  qBtnTextSm: { fontSize: 15, paddingVertical: 7 },
  qBtnTextDisabled: { opacity: 0.5 },
  qVal: { color: '#fff', fontSize: 13, fontWeight: '700', minWidth: 26, textAlign: 'center' },
  qValSm: { fontSize: 12, minWidth: 22 },
});
