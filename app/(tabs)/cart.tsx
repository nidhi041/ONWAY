import { C, shadow } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useAddresses } from '@/hooks/useFirestore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    Image as RNImage,
    ScrollView, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartItem = ({ item, onQty, onRemove }: {
  item: any;
  onQty: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}) => {
  // Support both Firestore string URLs (imageUrl) and local require() references (image)
  const imageSource = item.imageUrl
    ? { uri: item.imageUrl }
    : typeof item.image === 'string'
      ? { uri: item.image }
      : item.image || require('@/assets/images/medicine.png');
  return (
  <View style={st.item}>
    <View style={st.itemImgBox}>
      <RNImage source={imageSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
    <View style={st.itemBody}>
      <View style={st.itemTop}>
        <View style={{ flex: 1 }}>
          <Text style={st.itemBrand}>{item.brand}</Text>
          <Text style={st.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={st.itemDesc} numberOfLines={1}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={st.removeBtn}
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={st.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={st.itemBottom}>
        <View>
          <Text style={st.itemPrice}>₹{item.price}</Text>
          {item.originalPrice !== item.price && (
            <Text style={st.itemOrig}>₹{item.originalPrice}</Text>
          )}
        </View>
        <View style={st.qtyRow}>
          <TouchableOpacity
            style={st.qBtn}
            onPress={() => onQty(item.id, Math.max(1, item.quantity - 1))}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={st.qBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={st.qVal}>{item.quantity}</Text>
          <TouchableOpacity
            style={st.qBtn}
            onPress={() => onQty(item.id, item.quantity + 1)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={st.qBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </View>
  );
};

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { addresses } = useAddresses();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const defaultAddress = addresses?.find(a => a.isDefault) || addresses?.[0];

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  // Real coupon codes with meaningful discounts
  const VALID_COUPONS: Record<string, number> = {
    'MEDBIX10': Math.round(subtotal * 0.10 * 100) / 100,
    'MEDBIX20': Math.round(subtotal * 0.20 * 100) / 100,
    'FLAT50': subtotal >= 200 ? 50 : 0,
    'HEALTH15': Math.round(subtotal * 0.15 * 100) / 100,
  };
  const [couponError, setCouponError] = useState('');
  const discount = couponApplied ? (VALID_COUPONS[coupon.trim().toUpperCase()] ?? 0) : 0;
  const deliveryCharge = 100;
  const total    = subtotal - discount + deliveryCharge;

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={st.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={st.headerCenter}>
          <Text style={st.headerTitle}>My Cart</Text>
          {cartItems.length > 0 && <Text style={st.headerSub}>{cartItems.length} items</Text>}
        </View>
        {cartItems.length > 0
          ? <TouchableOpacity onPress={() => clearCart()} style={st.clearBtn}>
              <Text style={st.clearText}>Clear all</Text>
            </TouchableOpacity>
          : <View style={{ width: 60 }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: cartItems.length > 0 ? 130 : 32 }}>
        {cartItems.length > 0 ? (
          <>
            {/* Delivery info */}
            <View style={st.deliveryCard}>
              <View style={st.deliveryIconBox}>
                <Text style={st.deliveryIconText}>🚚</Text>
              </View>
              <View style={st.deliveryInfo}>
                <Text style={st.deliveryLabel}>DELIVERING TO {defaultAddress?.type?.toUpperCase() || 'HOME'}</Text>
                <Text style={st.deliveryAddr} numberOfLines={1}>{defaultAddress?.address || 'Please add an address at checkout'}</Text>
              </View>
              <View style={st.etaPill}>
                <Text style={st.etaText}>⚡ 15 min</Text>
              </View>
            </View>

            {/* Items */}
            <View style={st.section}>
              <Text style={st.sectionLabel}>Order Items</Text>
              <View style={st.itemsCard}>
                {cartItems.map((item, idx) => (
                  <View key={item.id}>
                    <CartItem
                      item={item}
                      onQty={(id, q) => { if (q > 0) updateQuantity(id, q); }}
                      onRemove={removeFromCart}
                    />
                    {idx < cartItems.length - 1 && <View style={st.itemDivider} />}
                  </View>
                ))}
              </View>
            </View>

            {/* Coupon */}
            <View style={st.section}>
              <Text style={st.sectionLabel}>Promo Code</Text>
              <View style={st.couponCard}>
                <Text style={st.couponIcon}>🎟️</Text>
                <TextInput
                  style={st.couponInput}
                  placeholder="Enter code (e.g. MEDBIX30)"
                  placeholderTextColor={C.inkMuted}
                  value={coupon}
                  onChangeText={setCoupon}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[st.couponBtn, couponApplied && st.couponBtnApplied]}
                  onPress={() => {
                    const code = coupon.trim().toUpperCase();
                    if (!code) { setCouponError('Please enter a coupon code'); return; }
                    const VALID_COUPONS_CHECK: Record<string, boolean> = {
                      'MEDBIX10': true, 'MEDBIX20': true, 'FLAT50': true, 'HEALTH15': true,
                    };
                    if (couponApplied) {
                      setCouponApplied(false); setCouponError('');
                    } else if (VALID_COUPONS_CHECK[code]) {
                      if (code === 'FLAT50' && subtotal < 200) {
                        setCouponError('FLAT50 requires minimum cart value of ₹200');
                      } else {
                        setCouponApplied(true); setCouponError('');
                      }
                    } else {
                      setCouponError('Invalid coupon code. Try MEDBIX10, MEDBIX20, or FLAT50');
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[st.couponBtnText, couponApplied && st.couponBtnTextApplied]}>
                    {couponApplied ? '✓ Applied' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
              {couponError ? (
                <View style={st.couponErrorBanner}>
                  <Text style={st.couponErrorText}>⚠️ {couponError}</Text>
                </View>
              ) : null}
              {couponApplied && (
                <View style={st.savingsBanner}>
                  <Text style={st.savingsText}>🎉 You saved ₹{discount.toFixed(2)} with this code!</Text>
                </View>
              )}
            </View>

            {/* Summary */}
            <View style={st.section}>
              <Text style={st.sectionLabel}>Price Breakdown</Text>
              <View style={st.summaryCard}>
                <View style={st.summaryRow}>
                  <Text style={st.summaryKey}>Subtotal ({cartItems.length} items)</Text>
                  <Text style={st.summaryVal}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={st.summaryRow}>
                  <Text style={st.summaryKey}>Delivery Fee</Text>
                  <Text style={st.summaryVal}>₹{deliveryCharge.toFixed(2)}</Text>
                </View>
                {discount > 0 && (
                  <View style={st.summaryRow}>
                    <Text style={st.summaryKey}>Promo Discount</Text>
                    <Text style={[st.summaryVal, { color: C.error }]}>−₹{discount.toFixed(2)}</Text>
                  </View>
                )}
                <View style={st.summaryDivider} />
                <View style={st.summaryRow}>
                  <Text style={st.summaryTotalKey}>Subtotal</Text>
                  <Text style={st.summaryTotalVal}>₹{total.toFixed(2)}</Text>
                </View>
                <View style={[st.summaryRow, { marginBottom: 0 }]}>
                  <Text style={[st.summaryKey, { fontStyle: 'italic', fontSize: 11 }]}>+ Tax (16.5%) calculated at checkout</Text>
                </View>
              </View>
            </View>

            {/* Trust note */}
            <View style={st.trustNote}>
              <Text style={st.trustNoteText}>🛡️  All medicines are verified & handled with strict hygiene standards</Text>
            </View>
          </>
        ) : (
          <View style={st.empty}>
            <View style={st.emptyIconBox}>
              <Text style={st.emptyIcon}>🛒</Text>
            </View>
            <Text style={st.emptyTitle}>Your cart is empty</Text>
            <Text style={st.emptySub}>Add medicines and health products to get started</Text>
            <TouchableOpacity style={st.shopBtn} onPress={() => router.back()} activeOpacity={0.88}>
              <Text style={st.shopBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Checkout bar */}
      {cartItems.length > 0 && (
        <View style={st.checkoutBar}>
          <View>
            <Text style={st.checkoutLabel}>Total Payable</Text>
            <Text style={st.checkoutAmount}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={st.checkoutBtn} onPress={() => router.push('/checkout')} activeOpacity={0.88}>
            <Text style={st.checkoutBtnText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.bg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 18, color: C.ink },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  headerSub: { fontSize: 11, color: C.inkMuted, marginTop: 1 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.errorBg },
  clearText: { fontSize: 12, color: C.error, fontWeight: '600' },

  deliveryCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: C.surface, borderRadius: 16,
    padding: 14, gap: 12,
    borderWidth: 1, borderColor: C.blueMid,
    ...shadow('sm'),
  },
  deliveryIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.blueLight, justifyContent: 'center', alignItems: 'center',
  },
  deliveryIconText: { fontSize: 20 },
  deliveryInfo: { flex: 1 },
  deliveryLabel: { fontSize: 9, color: C.blue, fontWeight: '800', letterSpacing: 0.6, marginBottom: 3 },
  deliveryAddr: { fontSize: 13, fontWeight: '600', color: C.ink },
  etaPill: { backgroundColor: C.successBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  etaText: { fontSize: 11, color: C.success, fontWeight: '700' },

  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 10 },

  itemsCard: {
    backgroundColor: C.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  item: { flexDirection: 'row', gap: 12 },
  itemImgBox: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden', backgroundColor: C.surfaceAlt },
  itemBody: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemBrand: { fontSize: 9, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  itemName: { fontSize: 13, fontWeight: '600', color: C.ink, lineHeight: 18 },
  itemDesc: { fontSize: 11, color: C.inkMuted, marginTop: 2 },
  removeBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: C.errorBg, justifyContent: 'center', alignItems: 'center' },
  removeIcon: { fontSize: 10, color: C.error, fontWeight: '700' },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: C.blue },
  itemOrig: { fontSize: 10, color: C.inkMuted, textDecorationLine: 'line-through' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.blueLight, borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: C.blueMid,
  },
  qBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qBtnText: { fontSize: 16, color: C.blue, fontWeight: '700' },
  qVal: { fontSize: 13, fontWeight: '700', color: C.blue, minWidth: 26, textAlign: 'center' },
  itemDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 12 },

  couponCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface, borderRadius: 14,
    padding: 12, borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed',
  },
  couponIcon: { fontSize: 18 },
  couponInput: { flex: 1, fontSize: 13, color: C.ink, padding: 0, fontWeight: '500' },
  couponBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.blue,
  },
  couponBtnApplied: { backgroundColor: C.successBg, borderColor: C.success },
  couponBtnText: { fontSize: 12, color: C.blue, fontWeight: '700' },
  couponBtnTextApplied: { color: C.success },
  savingsBanner: {
    marginTop: 8, backgroundColor: C.successBg, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  savingsText: { fontSize: 12, color: C.success, fontWeight: '600' },
  couponErrorBanner: {
    marginTop: 8, backgroundColor: C.errorBg, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  couponErrorText: { fontSize: 12, color: C.error, fontWeight: '500' },

  summaryCard: {
    backgroundColor: C.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryKey: { fontSize: 13, color: C.inkSub },
  summaryVal: { fontSize: 13, fontWeight: '600', color: C.ink },
  freePill: { backgroundColor: C.successBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  freePillText: { fontSize: 10, color: C.success, fontWeight: '800' },
  summaryDivider: { height: 1, backgroundColor: C.borderLight, marginBottom: 12 },
  summaryTotalKey: { fontSize: 15, fontWeight: '700', color: C.ink },
  summaryTotalVal: { fontSize: 20, fontWeight: '800', color: C.blue },

  trustNote: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.blueLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  trustNoteText: { fontSize: 12, color: C.blue, fontWeight: '500', lineHeight: 18 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIconBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: C.blueLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.inkMuted, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  shopBtn: {
    backgroundColor: C.blue, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
    ...shadow('blue'),
  },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  checkoutBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 }
      : { elevation: 8 }),
  },
  checkoutLabel: { fontSize: 11, color: C.inkMuted, marginBottom: 2 },
  checkoutAmount: { fontSize: 20, fontWeight: '800', color: C.ink },
  checkoutBtn: {
    backgroundColor: C.blue, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 13,
    ...shadow('blue'),
  },
  checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
