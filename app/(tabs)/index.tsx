import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { Skeleton } from '@/components/ui/Skeleton';
import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Animated, Dimensions,
    FlatList, ImageBackground,
    Image as RNImage, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;
const CARD_W = (W - 40 - 12) / 2;

const CATS = [
  { id: '1', name: 'Medicines',   emoji: '💊', color: '#EFF6FF', filterName: 'Medicines' },
  { id: '2', name: 'First Aid',   emoji: '🩹', color: '#FFF1F2', filterName: 'First Aid' },
  { id: '3', name: 'Vitamins',    emoji: '🧴', color: '#F0FDFA', filterName: 'Vitamins' },
  { id: '4', name: 'Pain Relief', emoji: '🩺', color: '#FFFBEB', filterName: 'Pain Relief' },
  { id: '5', name: 'Cold & Flu',  emoji: '🤧', color: '#EFF6FF', filterName: 'Cold & Flu' },
  { id: '6', name: 'Skin Care',   emoji: '🧼', color: '#FDF4FF', filterName: 'Skin Care' },
];

const TRUST_BADGES = [
  { icon: '⚡', label: '10-min\nDelivery' },
  { icon: '✅', label: 'Verified\nMedicines' },
  { icon: '🔒', label: 'Secure\nPayments' },
];

const QUICK_ACTIONS = [
  { id: 'pharmacy', name: 'Pharmacy', emoji: '💊', color: '#EFF6FF' },
  { id: 'labs', name: 'Labtests', emoji: '🔬', color: '#FFF1F2' },
  { id: 'generics', name: 'Generics', emoji: '🩺', color: '#FFFBEB' },
];

const SUMMER_ESSENTIALS = [
  { name: 'Sunscreen', emoji: '🧴', color: '#FFFBEB' },
  { name: 'Face Wash', emoji: '🧼', color: '#EFF6FF' },
  { name: 'Lip Care', emoji: '💄', color: '#FFF1F2' },
  { name: 'Hair Care', emoji: '💇', color: '#FDF4FF' },
  { name: 'Baby Care', emoji: '🍼', color: '#F0FDFA' },
  { name: 'Soap & Body wash', emoji: '🚿', color: '#EFF6FF' },
];

const POPULAR_CATEGORIES = [
  { name: 'Vitamins & Supplement', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343380/vitamin_and_Supplement_klycqd.png' },
  { name: 'Homeopathic Medicine', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343380/Homeopethic_Medicine_fmjdmx.png' },
  { name: 'Monitoring Devices', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343380/Monitoring_Machine_w69sr6.png' },
  { name: 'Protein & Supplement', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343380/Protein_supplement_ifecyo.png' },
  { name: 'Sexual Wellness', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343380/Sexual_Wllness_yja4b2.png' },
  { name: 'Ayurvedic Wellness', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343379/Ayurvedic_wellness_yhmte4.png' },
  { name: 'Food & Nutrition', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343379/Food_Nutrition_zoiwxs.png' },
  { name: 'Skin Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343378/Skin_care_tkymi7.png' },
  { name: 'Men Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343379/Men_care_ayw1gi.png' },
  { name: 'Women Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343378/Women_care_oxzizi.png' },
  { name: 'Pain Relief', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343378/Pain_relief_onmg1v.png' },
  { name: 'Hair Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/Hair_care_h71ylm.png' },
  { name: 'Oral Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/Oral_care_flpymq.png' },
  { name: 'Cold Cough & Fever', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343378/Cold_cough_and_fever_wyhbga.png' },
  { name: 'First Aid', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/First_aid_irbcod.png' },
  { name: 'Mental Wellness', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/Mental_Wellness_dudcml.png' },
  { name: 'Baby Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/Baby_care_gddibb.png' },
  { name: 'Respiratory Care', imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1780343376/Respiratory_Care_zx610s.png' },
];



const BABY_CARE_ESSENTIALS = [
  { name: 'Diapers & Wipes', emoji: '🧻' },
  { name: 'Baby Food', emoji: '🍼' },
  { name: 'Baby Skin Care', emoji: '🧴' },
  { name: 'Baby Bath', emoji: '🚿' },
  { name: 'Baby Accessories', emoji: '🧸' },
  { name: 'Feeding & Nursing', emoji: '👶' },
];

const ADULT_DIAPERS: Product[] = [
  {
    id: 'diaper_1',
    name: 'Friends Adult Diaper Easy - Medium',
    brand: 'FRIENDS',
    category: 'Personal Care',
    price: 420,
    originalPrice: 550,
    rating: 4.6,
    reviews: 140,
    deliveryTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1522850959076-58d7c04f85e5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'diaper_2',
    name: 'Friends Premium Adult Diaper Pants - Large',
    brand: 'FRIENDS',
    category: 'Personal Care',
    price: 510,
    originalPrice: 650,
    rating: 4.8,
    reviews: 210,
    deliveryTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1522850959076-58d7c04f85e5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'diaper_3',
    name: 'Friends Classic Adult Diaper - XL',
    brand: 'FRIENDS',
    category: 'Personal Care',
    price: 590,
    originalPrice: 720,
    rating: 4.7,
    reviews: 88,
    deliveryTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1522850959076-58d7c04f85e5?auto=format&fit=crop&w=300&q=80',
  },
];

// ─── Category Chip ─────────────────────────────────────────────────────────────
const CatChip = ({ item, onPress }: { item: typeof CATS[0]; onPress: () => void }) => (
  <TouchableOpacity style={[st.catChip, { backgroundColor: item.color }]} onPress={onPress} activeOpacity={0.75}>
    <Text style={st.catEmoji}>{item.emoji}</Text>
    <Text style={st.catName}>{item.name}</Text>
  </TouchableOpacity>
);

// ─── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const src = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/images/medicine.png');
  const disc = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  return (
    <TouchableOpacity style={st.card} onPress={onPress} activeOpacity={0.88}>
      <View style={st.cardImgBox}>
        <RNImage source={src} style={st.cardImg} resizeMode="cover" />
        {disc > 0 && (
          <View style={st.discBadge}>
            <Text style={st.discText}>{disc}% OFF</Text>
          </View>
        )}
        <View style={st.etaBadge}>
          <Text style={st.etaText}>⚡ {product.deliveryTime}m</Text>
        </View>
      </View>
      <View style={st.cardBody}>
        <Text style={st.cardCat}>{product.category}</Text>
        <Text style={st.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={st.cardRating}>
          <Text style={st.ratingText}>★ {product.rating}</Text>
        </View>
        <View style={st.cardPriceRow}>
          <Text style={st.cardPrice}>₹{product.price}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={st.cardOrig}>₹{product.originalPrice}</Text>
          )}
        </View>
        <AddToCartButton product={product} size="small" />
      </View>
    </TouchableOpacity>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHead = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={st.sectionHead}>
    <Text style={st.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={st.seeAll}>See all →</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Home Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { products, loading, refresh } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(120)).current;

  const totalQty   = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasCart    = cartItems.length > 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: hasCart ? 0 : 120,
      useNativeDriver: true, tension: 80, friction: 10,
    }).start();
  }, [hasCart]);

  if (loading) {
    return (
      <SafeAreaView style={st.container}>
        <View style={st.loadingBox}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[st.card, { padding: 12, borderWidth: 1, borderColor: '#f1f5f9' }]}>
                <Skeleton style={{ width: '100%', height: 100, borderRadius: 12, marginBottom: 12 }} />
                <Skeleton style={{ width: '80%', height: 14, marginBottom: 8 }} />
                <Skeleton style={{ width: '40%', height: 12, marginBottom: 12 }} />
                <Skeleton style={{ width: '100%', height: 32, borderRadius: 8 }} />
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: hasCart ? 130 : 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }} colors={[C.blue]} />
        }
      >

        {/* ── Header ── */}
        <View style={st.header}>
          <View style={st.headerLeft}>
            <View style={st.logoRow}>
              <View style={st.logoDot} />
              <Text style={st.logoText}>OnWay</Text>
            </View>
            <TouchableOpacity style={st.locRow} activeOpacity={0.7}>
              <Text style={st.locPin}>📍</Text>
              <Text style={st.locAddr}>Home · Apt 4B</Text>
              <Text style={st.locChev}>›</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={st.avatarBtn} onPress={() => router.push('/profile')} activeOpacity={0.85}>
            <Text style={st.avatarInitial}>{user?.name ? user.name.charAt(0).toUpperCase() : '👤'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <TouchableOpacity style={st.searchBar} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.85}>
          <Text style={st.searchIcon}>🔍</Text>
          <Text style={st.searchHint}>Search medicines, vitamins, health…</Text>
          <View style={st.searchFilter}>
            <Text style={st.searchFilterText}>Filter</Text>
          </View>
        </TouchableOpacity>

        {/* ── Trust Badges ── */}
        <View style={st.trustRow}>
          {TRUST_BADGES.map(b => (
            <View key={b.label} style={st.trustBadge}>
              <Text style={st.trustIcon}>{b.icon}</Text>
              <Text style={st.trustLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions Row ── */}
        <View style={st.quickActionsRow}>
          {QUICK_ACTIONS.map(q => (
            <TouchableOpacity key={q.id} style={st.quickActionItem} activeOpacity={0.75} onPress={() => router.push(`/(tabs)/category?name=Medicines`)}>
              <View style={[st.quickActionCircle, { backgroundColor: q.color }]}>
                <Text style={st.quickActionEmoji}>{q.emoji}</Text>
              </View>
              <Text style={st.quickActionLabel}>{q.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Prescription Upload Banner ── */}
        <View style={st.prescriptionCard}>
          <View style={st.prescriptionLeft}>
            <Text style={st.prescriptionEmoji}>📋</Text>
            <View style={st.prescriptionTexts}>
              <Text style={st.prescriptionTitle}>Order with prescription</Text>
              <Text style={st.prescriptionSub}>Upload & we'll search medicines for you</Text>
            </View>
          </View>
          <TouchableOpacity style={st.uploadBtn} activeOpacity={0.8} onPress={() => router.push('/profile')}>
            <Text style={st.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* ── Categories ── */}
        <View style={st.section}>
          <SectionHead title="Categories" />
          <View style={st.catRow}>
            {CATS.map(c => (
              <CatChip key={c.id} item={c} onPress={() => router.push(`/(tabs)/category?name=${c.filterName}`)} />
            ))}
          </View>
        </View>

        {/* ── Hero Banner ── */}
        <View style={st.bannerWrap}>
          <ImageBackground
            source={require('@/assets/images/dealBg.png')}
            style={st.banner}
            imageStyle={st.bannerImg}
          >
            <View style={st.bannerOverlay}>
              <View style={st.bannerPill}>
                <Text style={st.bannerPillText}>🔥 Limited Time</Text>
              </View>
              <Text style={st.bannerTitle}>Up to 20% Off</Text>
              <Text style={st.bannerSub}>On all medicines & health products</Text>
              <TouchableOpacity
                style={st.bannerBtn}
                onPress={() => router.push('/(tabs)/category?name=Medicines')}
                activeOpacity={0.88}
              >
                <Text style={st.bannerBtnText}>Shop Now →</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* ── Previously Ordered Items ── */}
        <View style={st.section}>
          <SectionHead
            title="Previously ordered items"
            onSeeAll={() => router.push('/(tabs)/category?name=Medicines')}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products.slice(0, 3)}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)} />
            )}
            keyExtractor={i => i.id}
            contentContainerStyle={st.hList}
          />
        </View>

        {/* ── Trending ── */}
        <View style={st.section}>
          <SectionHead
            title="Trending Now"
            onSeeAll={() => router.push('/(tabs)/category?name=Medicines')}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products.slice(0, Math.ceil(products.length / 2))}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)} />
            )}
            keyExtractor={i => i.id}
            contentContainerStyle={st.hList}
          />
        </View>

        {/* ── Best Sellers ── */}
        <View style={st.section}>
          <SectionHead
            title="Best Sellers"
            onSeeAll={() => router.push('/(tabs)/category?name=Medicines')}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products.slice(Math.ceil(products.length / 2))}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)} />
            )}
            keyExtractor={i => i.id}
            contentContainerStyle={st.hList}
          />
        </View>

        {/* ── Summer Essentials ── */}
        <View style={st.section}>
          <View style={st.sectionHead}>
            <View>
              <Text style={st.sectionTitle}>Summer Essentials</Text>
              <Text style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>A time to shine and protect more</Text>
            </View>
          </View>
          <View style={st.summerGrid}>
            {SUMMER_ESSENTIALS.map((s, index) => (
              <TouchableOpacity key={index} style={[st.summerItem, { backgroundColor: s.color }]} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/category?name=Skin Care`)}>
                <Text style={st.summerEmoji}>{s.emoji}</Text>
                <Text style={st.summerLabel}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Popular Categories ── */}
        <View style={st.section}>
          <SectionHead title="Popular categories" />
          <View style={st.popularGrid}>
            {POPULAR_CATEGORIES.map((c, index) => (
              <TouchableOpacity key={index} style={st.popularItem} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/category?name=${c.name}`)}>
                <View style={st.popularIconBox}>
                  <RNImage source={{ uri: c.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
                <Text style={st.popularLabel} numberOfLines={2}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* ── Baby Care Essentials ── */}
        <View style={st.section}>
          <SectionHead title="Baby Care Essentials" />
          <View style={st.popularGrid}>
            {BABY_CARE_ESSENTIALS.map((c, index) => (
              <TouchableOpacity key={index} style={st.popularItem} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/category?name=Skin Care`)}>
                <View style={st.popularIconBox}>
                  <Text style={st.popularEmoji}>{c.emoji}</Text>
                </View>
                <Text style={st.popularLabel} numberOfLines={2}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Friends Adult Diapers ── */}
        <View style={st.section}>
          <SectionHead title="Friends Adult Diapers (Min 15% Off)" onSeeAll={() => router.push('/(tabs)/category?name=Medicines')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ADULT_DIAPERS}
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)} />
            )}
            keyExtractor={i => i.id}
            contentContainerStyle={st.hList}
          />
        </View>

      </ScrollView>

      {/* ── Floating Cart Bar ── */}
      <Animated.View
        style={[st.cartBar, { transform: [{ translateY: slideAnim }] }]}
        pointerEvents={hasCart ? 'auto' : 'none'}
      >
        <TouchableOpacity style={st.cartBarInner} onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.92}>
          <View style={st.cartBarLeft}>
            <View style={st.cartBadge}>
              <Text style={st.cartBadgeText}>{totalQty}</Text>
            </View>
            <View>
              <Text style={st.cartBarLabel}>{totalQty} {totalQty === 1 ? 'item' : 'items'} in cart</Text>
              <Text style={st.cartBarSub}>Tap to review order</Text>
            </View>
          </View>
          <View style={st.cartBarRight}>
            <Text style={st.cartBarPrice}>₹{totalPrice.toFixed(0)}</Text>
            <Text style={st.cartBarCta}>View →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.inkMuted },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  headerLeft: { gap: 4 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal },
  logoText: { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locPin: { fontSize: 11 },
  locAddr: { fontSize: 12, color: C.inkSub, fontWeight: '500' },
  locChev: { fontSize: 14, color: C.blue, fontWeight: '700' },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center',
    ...shadow('blue'),
  },
  avatarInitial: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: C.border,
    ...shadow('sm'),
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchHint: { flex: 1, fontSize: 14, color: C.inkMuted },
  searchFilter: {
    backgroundColor: C.blueLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  searchFilterText: { fontSize: 11, color: C.blue, fontWeight: '700' },

  // trust
  trustRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    backgroundColor: C.surface, borderRadius: 14,
    paddingVertical: 14, borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  trustBadge: { flex: 1, alignItems: 'center', gap: 4 },
  trustIcon: { fontSize: 20 },
  trustLabel: { fontSize: 10, color: C.inkSub, textAlign: 'center', fontWeight: '600', lineHeight: 14 },

  // section
  section: { marginBottom: 28 },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  seeAll: { fontSize: 13, color: C.blue, fontWeight: '600' },

  // categories
  catRow: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catChip: {
    width: (W - 40 - 24) / 3,
    alignItems: 'center', borderRadius: 16,
    paddingHorizontal: 8, paddingVertical: 14, gap: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  catEmoji: { fontSize: 22 },
  catName: { fontSize: 11, color: C.inkSub, fontWeight: '600', textAlign: 'center' },

  // banner
  bannerWrap: { marginHorizontal: 20, marginBottom: 28 },
  banner: { borderRadius: 20, overflow: 'hidden', minHeight: 160 },
  bannerImg: { borderRadius: 20 },
  bannerOverlay: {
    flex: 1, minHeight: 160, padding: 22, justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.52)',
  },
  bannerPill: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  bannerPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4, letterSpacing: -0.5 },
  bannerSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginBottom: 18 },
  bannerBtn: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 18, alignSelf: 'flex-start',
  },
  bannerBtnText: { color: C.blue, fontSize: 13, fontWeight: '700' },

  // product card
  hList: { paddingHorizontal: 20, gap: 12 },
  card: {
    width: CARD_W, backgroundColor: C.surface, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  cardImgBox: { position: 'relative', backgroundColor: C.surfaceAlt },
  cardImg: { width: '100%', height: 128 },
  discBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: C.error, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  discText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  etaBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  etaText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardBody: { padding: 10 },
  cardCat: { fontSize: 9, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  cardName: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 4, lineHeight: 18 },
  cardRating: { marginBottom: 5 },
  ratingText: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: C.blue },
  cardOrig: { fontSize: 11, color: C.inkMuted, textDecorationLine: 'line-through' },

  // cart bar
  cartBar: {
    position: 'absolute', bottom: 74, left: 16, right: 16,
    backgroundColor: C.dark, borderRadius: 18,
    ...shadow('lg'),
  },
  cartBarInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cartBarLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cartBarSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cartBarCta: { color: C.teal, fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Quick Actions Row
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  quickActionEmoji: { fontSize: 28 },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.inkSub,
  },

  // Prescription Card
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  prescriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  prescriptionEmoji: { fontSize: 26 },
  prescriptionTexts: { flex: 1 },
  prescriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
  },
  prescriptionSub: {
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 2,
  },
  uploadBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Popular grid
  popularGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  popularItem: {
    width: (W - 40 - 36) / 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  popularIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  popularEmoji: { fontSize: 24 },
  popularLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.inkSub,
    textAlign: 'center',
  },

  // Summer Grid
  summerGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summerItem: {
    width: (W - 40 - 24) / 3,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  summerEmoji: { fontSize: 24 },
  summerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.inkSub,
    textAlign: 'center',
  },
});
