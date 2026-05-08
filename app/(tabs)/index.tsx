import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Category {
  id: string;
  name: string;
  emoji: string;
  filterName: string; // the category name passed to the category screen
}

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Medicines',   emoji: '💊', filterName: 'Medicines' },
  { id: '2', name: 'First Aid',   emoji: '🩹', filterName: 'First Aid' },
  { id: '3', name: 'Vitamins',    emoji: '🧴', filterName: 'Vitamins' },
  { id: '4', name: 'Pain Relief', emoji: '🩺', filterName: 'Pain Relief' },
  { id: '5', name: 'Cold & Flu',  emoji: '🤧', filterName: 'Cold & Flu' },
  { id: '6', name: 'Skin Care',   emoji: '🧼', filterName: 'Skin Care' },
];

// Category Item Component
const CategoryItem = ({ category, onPress }: { category: Category; onPress?: () => void }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.categoryIconContainer}>
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
);

// Product Card Component
const ProductCard = ({ product, onPress }: { product: Product; onPress?: () => void }) => {
  const imageSource = product.imageUrl
    ? { uri: product.imageUrl }
    : product.image || require('@/assets/ProductImage/red-bull.avif');

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.9}>
      <RNImage source={imageSource} style={styles.productImage} />
      <View style={styles.deliveryTimeBadge}>
        <Text style={styles.deliveryTimeText}>{product.deliveryTime} mins</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>⭐ {product.rating}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>
        <AddToCartButton product={product} size="small" />
      </View>
    </TouchableOpacity>
  );
};

// Promotional Banner Component
const PromoBanner = ({ onShopNow }: { onShopNow: () => void }) => (
  <ImageBackground
    source={require('@/assets/images/dealBg.png')}
    style={styles.promoBanner}
    imageStyle={styles.promoBannerImage}
  >
    <View style={styles.promoContent}>
      <Text style={styles.freshDealsLabel}>Health Deals</Text>
      <Text style={styles.promoTitle}>Up to 20% OFF</Text>
      <Text style={styles.promoSubtitle}>On all medicines & health products</Text>
      <TouchableOpacity style={styles.shopNowButton} onPress={onShopNow} activeOpacity={0.85}>
        <Text style={styles.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

export default function HomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'delivery' | 'offers'>('delivery');
  const slideAnim = useRef(new Animated.Value(100)).current;

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartHasItems = cartItems.length > 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cartHasItems ? 0 : 100,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [cartHasItems]);

  if (productsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: cartHasItems ? 100 : 20 }}
      >
        {/* Logo and Profile */}
        <View style={styles.brandSection}>
          <Text style={styles.logo}>⚡</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: Colors.light.text, pointerEvents: 'none' }]}
              placeholder="Search medicines, grocery, cosmetics..."
              placeholderTextColor="#ccc"
              editable={false}
            />
          </View>
        </TouchableOpacity>

        {/* Delivery & Offers Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'delivery' && styles.activeTab]}
            onPress={() => setActiveTab('delivery')}
          >
            <Text style={styles.tabText}>💧 Fast Delivery in 10 mins</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={styles.tabText}>Offers</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onPress={() => router.push(`/(tabs)/category?name=${category.filterName}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner */}
        <View style={styles.section}>
          <PromoBanner onShopNow={() => router.push('/(tabs)/category?name=Medicines')} />
        </View>

        {/* Trending Now Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allProducts.slice(0, Math.ceil(allProducts.length / 2))}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEventThrottle={16}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>

        {/* Best Sellers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>Best Sellers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allProducts.slice(Math.ceil(allProducts.length / 2))}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEventThrottle={16}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Cart Bar */}
      <Animated.View style={[styles.cartBar, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.cartBarInner} onPress={() => router.push('/(tabs)/cart')}>
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
            </Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarPrice}>₹{totalCartPrice.toFixed(0)}</Text>
            <Text style={styles.cartBarAction}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  topBar: { height: 12, backgroundColor: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logo: { fontSize: 32, fontWeight: '700' },
  profileIcon: { fontSize: 32 },
  searchContainer: { paddingVertical: 12 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTab: { backgroundColor: '#e3f2fd' },
  tabText: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: Colors.light.text },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: Colors.light.text },
  viewAll: { fontSize: 12, color: '#2196F3', fontWeight: '600' },
  categoriesScroll: { paddingHorizontal: 0 },
  categoryItem: { alignItems: 'center', marginRight: 16, minWidth: 70 },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: 11, textAlign: 'center', fontWeight: '500', color: Colors.light.text },
  promoBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'center',
  },
  promoBannerImage: { borderRadius: 16 },
  promoContent: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    minHeight: 150,
    borderRadius: 16,
  },
  freshDealsLabel: { color: '#FFA726', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  promoTitle: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  promoSubtitle: { color: '#ccc', fontSize: 12, marginBottom: 12 },
  shopNowButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  shopNowText: { color: '#2c3e50', fontWeight: '600', fontSize: 12 },
  horizontalListContent: { paddingHorizontal: 0, gap: 12 },
  productCard: {
    width: (SCREEN_WIDTH - 32 - 24) / 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: { width: '100%', height: 120, backgroundColor: '#e0e0e0' },
  deliveryTimeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  deliveryTimeText: { color: 'white', fontSize: 10, fontWeight: '500' },
  productInfo: { padding: 10 },
  productCategory: { fontSize: 9, color: '#999', fontWeight: '500', marginBottom: 2 },
  productName: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: Colors.light.text },
  ratingRow: { marginBottom: 6 },
  ratingText: { fontSize: 11, fontWeight: '500', color: Colors.light.text },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  price: { fontSize: 14, fontWeight: '700', color: '#2196F3' },
  originalPrice: { fontSize: 11, color: '#ccc', textDecorationLine: 'line-through' },
  bottomSpacer: { height: 20 },
  cartBar: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cartBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: 'white', fontSize: 13, fontWeight: '700' },
  cartBarLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarPrice: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cartBarAction: { color: '#35aeff', fontSize: 12, fontWeight: '600', marginTop: 2 },
});
