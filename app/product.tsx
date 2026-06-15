import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { C, shadow } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Animated, Dimensions, Platform,
    Image as RNImage, ScrollView, StatusBar, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;

const RelatedCard = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const src = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/images/medicine.png');
  return (
    <TouchableOpacity style={st.relCard} onPress={onPress} activeOpacity={0.85}>
      <View style={st.relImgBox}><RNImage source={src} style={st.relImg} resizeMode="cover" /></View>
      <View style={st.relBody}>
        <Text style={st.relName} numberOfLines={2}>{product.name}</Text>
        <Text style={st.relPrice}>₹{product.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, cartItems } = useCart();
  const { products: allProducts } = useProducts();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(120)).current;

  const totalQty   = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasCart    = cartItems.length > 0;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: hasCart ? 0 : 120, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }, [hasCart]);

  useEffect(() => {
    setLoading(true);
    const id = params.id as string;
    if (id && allProducts.length > 0) {
      const p = allProducts.find(x => x.id === id);
      if (p) { setProduct(p); setRelated(allProducts.filter(x => x.id !== id).slice(0, 4)); }
    }
    setLoading(false);
  }, [params.id, allProducts]);

  if (loading || !product) {
    return (
      <SafeAreaView style={st.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={C.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const disc = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const addAll = () => { for (let i = 0; i < qty; i++) addToCart(product); };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.headerBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={st.headerBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={st.headerTitle}>Product Details</Text>
        <TouchableOpacity
          style={[st.headerBtn, wishlisted && st.headerBtnWishlisted]}
          onPress={() => setWishlisted(!wishlisted)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={st.headerBtnText}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hasCart ? 180 : 120 }}>

        {/* Image section */}
        <View style={st.imgSection}>
          {disc > 0 && (
            <View style={st.discBadge}>
              <Text style={st.discText}>{disc}% OFF</Text>
            </View>
          )}
          <View style={st.deliveryBadge}>
            <Text style={st.deliveryBadgeText}>⚡ 10–20 min</Text>
          </View>
          <RNImage
            source={product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/images/medicine.png')}
            style={st.productImg}
            resizeMode="contain"
          />
        </View>

        {/* Info */}
        <View style={st.infoSection}>
          {/* Brand + name */}
          <Text style={st.brand}>{product.brand}</Text>
          <Text style={st.name}>{product.name}</Text>

          {/* Rating row */}
          <View style={st.ratingRow}>
            <View style={st.ratingPill}>
              <Text style={st.ratingStars}>★ {product.rating}</Text>
            </View>
            <Text style={st.ratingCount}>128 reviews</Text>
            <View style={st.verifiedPill}>
              <Text style={st.verifiedText}>✓ Verified</Text>
            </View>
          </View>

          {/* Price */}
          <View style={st.priceRow}>
            <Text style={st.price}>₹{product.price}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={st.origPrice}>₹{product.originalPrice}</Text>
            )}
            {disc > 0 && (
              <View style={st.savePill}>
                <Text style={st.savePillText}>Save {disc}%</Text>
              </View>
            )}
          </View>

          {/* Delivery info */}
          <View style={st.deliveryBox}>
            <View style={st.deliveryBoxIcon}><Text style={{ fontSize: 20 }}>🚚</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.deliveryBoxTitle}>Free Express Delivery</Text>
              <Text style={st.deliveryBoxSub}>Estimated arrival in 10–20 minutes</Text>
            </View>
            <Text style={st.deliveryBoxArrow}>›</Text>
          </View>

          {/* Quantity */}
          <View style={st.qtySection}>
            <Text style={st.qtyLabel}>Quantity</Text>
            <View style={st.qtyControl}>
              <TouchableOpacity style={st.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                <Text style={st.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={st.qtyVal}>{qty}</Text>
              <TouchableOpacity style={st.qtyBtn} onPress={() => setQty(q => q + 1)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                <Text style={st.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={st.descSection}>
            <Text style={st.descTitle}>About this product</Text>
            <Text style={st.descText}>{product.description}</Text>
          </View>

          {/* Related */}
          {related.length > 0 && (
            <View style={st.relSection}>
              <View style={st.relHeader}>
                <Text style={st.relTitle}>You May Also Like</Text>
                <TouchableOpacity><Text style={st.seeAll}>See all →</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {related.map(r => (
                  <RelatedCard key={r.id} product={r} onPress={() => router.push(`/product?id=${r.id}&name=${r.name}`)} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cart bar */}
      <Animated.View
        style={[st.cartBar, { transform: [{ translateY: slideAnim }] }]}
        pointerEvents={hasCart ? 'auto' : 'none'}
      >
        <TouchableOpacity style={st.cartBarInner} onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.9}>
          <View style={st.cartBarLeft}>
            <View style={st.cartBadge}><Text style={st.cartBadgeText}>{totalQty}</Text></View>
            <Text style={st.cartBarLabel}>{totalQty} item{totalQty !== 1 ? 's' : ''} in cart</Text>
          </View>
          <View style={st.cartBarRight}>
            <Text style={st.cartBarPrice}>₹{totalPrice.toFixed(0)}</Text>
            <Text style={st.cartBarCta}>View →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Actions */}
      <View style={st.actionsBar}>
        <TouchableOpacity style={st.buyNowBtn} onPress={() => { addAll(); router.push('/checkout'); }} activeOpacity={0.88}>
          <Text style={st.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <AddToCartButton product={product} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center',
  },
  headerBtnWishlisted: { backgroundColor: '#FEE2E2' },
  headerBtnText: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.ink },

  imgSection: {
    width: '100%', height: 300, backgroundColor: C.surfaceAlt,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  discBadge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: C.error, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, zIndex: 1,
  },
  discText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  deliveryBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, zIndex: 1,
  },
  deliveryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  productImg: { width: '100%', height: '100%' },

  infoSection: { padding: 20 },
  brand: { fontSize: 11, color: C.blue, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  name: { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 12, lineHeight: 30 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  ratingPill: { backgroundColor: '#FFFBEB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FEF3C7' },
  ratingStars: { fontSize: 13, color: '#D97706', fontWeight: '700' },
  ratingCount: { fontSize: 12, color: C.inkMuted },
  verifiedPill: { backgroundColor: C.tealLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#CCFBF1' },
  verifiedText: { fontSize: 11, color: C.teal, fontWeight: '700' },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  price: { fontSize: 32, fontWeight: '800', color: C.blue },
  origPrice: { fontSize: 15, color: C.inkMuted, textDecorationLine: 'line-through', fontWeight: '500' },
  savePill: { backgroundColor: C.successBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#BBF7D0' },
  savePillText: { fontSize: 11, color: C.success, fontWeight: '800' },

  deliveryBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.blueLight, borderRadius: 16,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: C.blueMid,
  },
  deliveryBoxIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center' },
  deliveryBoxTitle: { fontSize: 13, fontWeight: '700', color: C.blue, marginBottom: 2 },
  deliveryBoxSub: { fontSize: 12, color: C.inkSub },
  deliveryBoxArrow: { fontSize: 20, color: C.blue },

  qtySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  qtyLabel: { fontSize: 15, fontWeight: '700', color: C.ink },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.blueLight, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: C.blueMid,
  },
  qtyBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: C.blue },
  qtyVal: { fontSize: 16, fontWeight: '800', color: C.blue, minWidth: 36, textAlign: 'center' },

  descSection: { marginBottom: 24 },
  descTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 10 },
  descText: { fontSize: 14, lineHeight: 22, color: C.inkSub },

  relSection: { marginBottom: 16 },
  relHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  relTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  seeAll: { fontSize: 13, color: C.blue, fontWeight: '600' },
  relCard: {
    width: 130, backgroundColor: C.surface, borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  relImgBox: { backgroundColor: C.surfaceAlt },
  relImg: { width: '100%', height: 96 },
  relBody: { padding: 10 },
  relName: { fontSize: 12, fontWeight: '600', color: C.ink, marginBottom: 5, lineHeight: 16 },
  relPrice: { fontSize: 13, fontWeight: '800', color: C.blue },

  cartBar: {
    position: 'absolute', bottom: 82, left: 16, right: 16,
    backgroundColor: C.dark, borderRadius: 18,
    ...shadow('lg'),
  },
  cartBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cartBarLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cartBarCta: { color: C.teal, fontSize: 11, fontWeight: '700', marginTop: 2 },

  actionsBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16,
    paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.borderLight,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 }
      : { elevation: 8 }),
  },
  buyNowBtn: {
    flex: 1, height: 50, borderRadius: 14,
    borderWidth: 2, borderColor: C.blue,
    justifyContent: 'center', alignItems: 'center',
  },
  buyNowText: { fontSize: 15, fontWeight: '700', color: C.blue },
});
