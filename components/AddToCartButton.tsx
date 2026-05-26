import { Product } from '@/constants/products';
import { C } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props { product: Product; size?: 'small' | 'normal' }

export default function AddToCartButton({ product, size = 'normal' }: Props) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find(i => i.id === product.id);
  const qty = item?.quantity ?? 0;
  const sm = size === 'small';

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
      <TouchableOpacity style={s.qBtn} onPress={() => addToCart(product)} activeOpacity={0.75} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={[s.qBtnText, sm && s.qBtnTextSm]}>+</Text>
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

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.blue, borderRadius: 10, overflow: 'hidden', width: '100%',
  },
  rowSm: { borderRadius: 8 },
  qBtn: { flex: 1, paddingVertical: 9, justifyContent: 'center', alignItems: 'center' },
  qBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  qBtnTextSm: { fontSize: 15, paddingVertical: 7 },
  qVal: { color: '#fff', fontSize: 13, fontWeight: '700', minWidth: 26, textAlign: 'center' },
  qValSm: { fontSize: 12, minWidth: 22 },
});
