import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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



// Category Item Component
const CategoryItem = ({ category, onPress }: { category: Category; onPress?: () => void }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <RNImage source={category.icon} style={styles.categoryIconImage} resizeMode="cover" />
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
);
const CategoryItem = ({ category, onPress }: { category: Category; onPress?: () => void }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <TouchableOpacity 
      style={[styles.categoryItem, isPressed && styles.categoryItemPressed]} 
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.9}
    >
      <View style={styles.categoryIconContainer}>
        <RNImage source={category.icon} style={styles.categoryIconImage} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );
};

// Product Card Component
const ProductCard = ({ product, onPress }: { product: Product; onPress?: () => void }) => {
  const imageSource = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/ProductImage/red-bull.avif');
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <RNImage source={imageSource} style={styles.productImage} />
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
        <AddToCartButton product={product} size="small" />
    <TouchableOpacity 
      style={[styles.productCard, isPressed && styles.productCardPressed]} 
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.95}
    >
      <RNImage
        source={imageSource}
        style={styles.productImage}
      />
      


      {/* Discount Badge */}
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{product.category.toUpperCase()}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviews})</Text>
        </View>
        
        {/* Price Section */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={onAddToCart}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Promotional Banner Component
const PromoBanner = () => (
  <ImageBackground
    source={require('@/assets/images/dealBg.png')}
    style={styles.promoBanner}
    imageStyle={styles.promoBannerImage}
  >
    {/* Gradient Overlay */}
    <View style={styles.bannerGradientOverlay} />
    
    <View style={styles.promoContent}>
      <Text style={styles.freshDealsLabel}>✨ Fresh Deals</Text>
      <Text style={styles.promoTitle}>Up to 20% OFF</Text>
      <Text style={styles.promoSubtitle}>On all organic groceries</Text>
      <TouchableOpacity style={styles.shopNowButton} activeOpacity={0.85}>
        <Text style={styles.shopNowText}>Shop Now →</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

export default function HomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'delivery' | 'offers'>('delivery');
  const slideAnim = useRef(new Animated.Value(100)).current;

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartHasItems = cartItems.length > 0;
  const loading = productsLoading;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cartHasItems ? 0 : 100,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [cartHasItems]);

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
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.avatar && user.avatar.startsWith('http') ? (
              <RNImage source={{ uri: user.avatar }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle" size={42} color="#0C63E4" style={styles.profileIconVector} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: Colors.light.text, pointerEvents: 'none' }]}
              placeholder="Search medicines, grocery, cosmetics..."
              placeholderTextColor="#ccc"
              style={[styles.searchInput, { color: Colors.light.text }]}
              placeholder="Search medicines, grocery..."
              placeholderTextColor="#999"
              editable={false}
            />
            <Ionicons name="mic" size={20} color="#4285F4" style={styles.micIcon} />
          </View>
        </TouchableOpacity>

        {/* Delivery Banner */}
        <View style={styles.deliveryBannerContainer}>
          <View style={styles.deliveryBanner}>
            <View style={styles.deliveryIconContainer}>
              <Text style={styles.deliveryIcon}>⚡</Text>
            </View>
            <View style={styles.deliveryTextContainer}>
              <Text style={styles.deliveryBannerTitle}>Fast Delivery</Text>
              <Text style={styles.deliveryBannerSubtitle}>to your doorstep in 10 mins</Text>
            </View>
          </View>
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
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileIconVector: {
    marginLeft: 'auto',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 'auto',
    borderWidth: 2,
    borderColor: '#0C63E4',
  },
  
  // ===== SEARCH BAR =====
  searchContainer: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    fontWeight: '500',
  },
  micIcon: {
    marginLeft: 10,
  },

  // ===== DELIVERY BANNER =====
  deliveryBannerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#E8F1FF',
  },
  deliveryIconContainer: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  deliveryIcon: {
    fontSize: 20,
  },
  deliveryTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deliveryBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  deliveryBannerSubtitle: {
    fontSize: 12,
    color: '#0C63E4',
    fontWeight: '700',
    opacity: 0.9,
  },

  // ===== SECTIONS =====
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  viewAll: {
    fontSize: 13,
    color: '#0C63E4',
    fontWeight: '700',
  },

  // ===== CATEGORIES =====
  categoriesScroll: {
    paddingHorizontal: 0,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 75,
  },
  categoryItemPressed: {
    opacity: 0.8,
  },
  categoryIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryIconImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1a1a2e',
  },

  // ===== BANNER =====
  promoBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 160,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  promoBannerImage: {
    borderRadius: 16,
  },
  bannerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
  },
  promoContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: 160,
    borderRadius: 16,
    zIndex: 1,
  },
  freshDealsLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  promoSubtitle: {
    color: '#e0e0e0',
    fontSize: 13,
    marginBottom: 14,
    fontWeight: '500',
  },
  shopNowButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shopNowText: {
    color: '#0C63E4',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // ===== PRODUCT CARD =====
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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  productCardPressed: {
    elevation: 4,
    shadowOpacity: 0.1,
    transform: [{ scale: 0.97 }],
  },
  productImage: {
    width: '100%',
    height: 135,
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  deliveryTimeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryTimeIcon: {
    fontSize: 12,
  },
  deliveryTimeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4757',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1a1a2e',
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  reviewsText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  priceRow: {
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: -0.3,
  },
  originalPrice: {
    fontSize: 12,
    color: '#ccc',
    textDecorationLine: 'line-through',
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#0C63E4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ===== BOTTOM SPACER & CART BAR =====
  bottomSpacer: {
    height: 20,
  },
  cartBar: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    elevation: 8,
    boxShadow: '0px -2px 8px rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cartBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBadge: {
    backgroundColor: '#0C63E4',
    borderRadius: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cartBadgeText: { color: 'white', fontSize: 13, fontWeight: '800' },
  cartBarLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarPrice: { color: '#fff', fontSize: 15, fontWeight: '800' },
  cartBarAction: { color: '#35aeff', fontSize: 12, fontWeight: '700', marginTop: 3 },
});
