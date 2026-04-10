import { MOCK_BEST_SELLERS, MOCK_TRENDING_PRODUCTS, Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
    ImageSourcePropType,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: ImageSourcePropType;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Grocery', icon: require('@/assets/images/grocery.png') },
  { id: '2', name: 'Medicines', icon: require('@/assets/images/medicine.png') },
  { id: '3', name: 'Beauty', icon: require('@/assets/images/beauty.png') },
  { id: '4', name: 'Electronics', icon: require('@/assets/images/electronic.png') },
  { id: '5', name: 'Baby', icon: require('@/assets/images/babyCare.png') },
];

// API service functions
const apiService = {
  // Fetch categories from API
  fetchCategories: async (): Promise<Category[]> => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('https://api.onway.com/categories');
      // const data = await response.json();
      // return data;
      return MOCK_CATEGORIES;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return MOCK_CATEGORIES;
    }
  },

  // Fetch trending products
  fetchTrendingProducts: async (): Promise<Product[]> => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('https://api.onway.com/products/trending');
      // const data = await response.json();
      // return data;
      return MOCK_TRENDING_PRODUCTS;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return MOCK_TRENDING_PRODUCTS;
    }
  },

  // Fetch best sellers
  fetchBestSellers: async (): Promise<Product[]> => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('https://api.onway.com/products/best-sellers');
      // const data = await response.json();
      // return data;
      return MOCK_BEST_SELLERS;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      return MOCK_BEST_SELLERS;
    }
  },
};

// Category Item Component
const CategoryItem = ({ category, onPress }: { category: Category; onPress?: () => void }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <RNImage source={category.icon} style={styles.categoryIconImage} />
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
);

// Product Card Component
const ProductCard = ({ product, onPress, onAddToCart }: { product: Product; onPress?: () => void; onAddToCart?: () => void }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <RNImage
      source={product.image}
      style={styles.productImage}
    />
    <View style={styles.deliveryTimeBadge}>
      <Text style={styles.deliveryTimeText}>{product.deliveryTime} mins</Text>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productCategory}>{product.category}</Text>
      <Text style={styles.productName}>{product.name}</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>⭐ {product.rating}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// Promotional Banner Component
const PromoBanner = () => (
  <ImageBackground
    source={require('@/assets/images/dealBg.png')}
    style={styles.promoBanner}
    imageStyle={styles.promoBannerImage}
  >
    <View style={styles.promoContent}>
      <Text style={styles.freshDealsLabel}>Fresh Deals</Text>
      <Text style={styles.promoTitle}>Up to 20% OFF</Text>
      <Text style={styles.promoSubtitle}>On all organic groceries</Text>
      <TouchableOpacity style={styles.shopNowButton}>
        <Text style={styles.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'delivery' | 'offers'>('delivery');
  const slideAnim = useRef(new Animated.Value(100)).current;

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartHasItems = cartItems.length > 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cartHasItems ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [cartHasItems]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, trendingData, sellersData] = await Promise.all([
        apiService.fetchCategories(),
        apiService.fetchTrendingProducts(),
        apiService.fetchBestSellers(),
      ]);

      setCategories(categoriesData);
      setTrendingProducts(trendingData);
      setBestSellers(sellersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
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
          <Text style={styles.profileIcon}>👤</Text>
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
              style={[styles.searchInput, { color: Colors.light.text }]}
              placeholder="Search medicines, grocery, cosmetics..."
              placeholderTextColor="#ccc"
              editable={false}
              pointerEvents="none"
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
                onPress={() => router.push(`/(tabs)/category?name=${category.name}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner */}
        <View style={styles.section}>
          <PromoBanner />
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
            data={trendingProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
                onAddToCart={() => addToCart(item)}
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
            data={bestSellers}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
                onAddToCart={() => addToCart(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEventThrottle={16}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>

        {/* Bottom spacer for nav bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Blinkit-style Cart Bar */}
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  topBar: {
    height: 12,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerIcon: {
    fontSize: 14,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileIcon: {
    fontSize: 32,
  },
  searchContainer: {
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: Colors.light.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.light.text,
  },
  viewAll: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryIconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    color: Colors.light.text,
  },
  promoBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'center',
  },
  promoBannerImage: {
    borderRadius: 16,
    resizeMode: 'cover',
  },
  promoContent: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    minHeight: 150,
    borderRadius: 16,
  },
  freshDealsLabel: {
    color: '#FFA726',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 12,
  },
  shopNowButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: 12,
  },
  productRow: {
    gap: 12,
    marginBottom: 12,
  },
  horizontalListContent: {
    paddingHorizontal: 0,
    gap: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 32 - 24) / 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  deliveryTimeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  deliveryTimeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
  },
  ratingRow: {
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  originalPrice: {
    fontSize: 11,
    color: '#ccc',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
  // Cart bar (Blinkit style)
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
