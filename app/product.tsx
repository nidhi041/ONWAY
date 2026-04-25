import { Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const RelatedProductCard = ({ product }: { product: Product }) => {
  const imageSource = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/ProductImage/red-bull.avif');
  return (
    <TouchableOpacity style={styles.relatedCard}>
      <RNImage source={imageSource} style={styles.relatedImage} />
      <Text style={styles.relatedName}>{product.name}</Text>
      <View style={styles.relatedPriceRow}>
        <Text style={styles.relatedPrice}>₹{product.price}</Text>
        <View style={styles.relatedRating}>
          <Text style={styles.relatedRatingText}>⭐ {product.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, cartItems } = useCart();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(100)).current;

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartHasItems = cartItems.length > 0;

  // Animate cart bar in/out
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cartHasItems ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [cartHasItems]);

  // Fetch product and related products from Firestore
  useEffect(() => {
    setLoading(true);
    const productId = params.id as string;
    if (productId && allProducts.length > 0) {
      const foundProduct = allProducts.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        // Get related products from same category
        const related = allProducts
          .filter(p => p.category === foundProduct.category && p.id !== productId)
          .slice(0, 3);
        setRelatedProducts(related);
      }
    }
    setLoading(false);
  }, [params.id, allProducts]);

  if (loading || !product) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C63E4" />
        </View>
      </View>
    );
  }

  const discountPercent =
    product.originalPrice && product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartHasItems ? 160 : 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>Product Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsWishlisted(!isWishlisted)}>
              <Text style={styles.headerIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.headerIcon}>↗️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryBadgeText}>⏱️ Fast 10-20 min</Text>
          </View>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <RNImage 
            source={product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/ProductImage/red-bull.avif')} 
            style={styles.productImage} 
          />
          <View style={styles.imageDot} />
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={[styles.productName, { color: Colors.light.text }]}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>⭐</Text>
            <Text style={styles.reviews}>{product.reviews} Reviews</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
            <Text style={styles.discount}>Save {discountPercent}%</Text>
          </View>

          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryIcon}>🚚</Text>
            <View style={styles.deliveryTextContainer}>
              <Text style={styles.deliveryTitle}>FAST DELIVERY</Text>
              <Text style={styles.deliveryTime}>
                Arriving in {product.deliveryTime}-{product.deliveryTime + 10} mins
              </Text>
              <Text style={styles.deliverySubtext}>Order now for priority delivery</Text>
            </View>
            <Text style={styles.deliveryArrow}>›</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: Colors.light.text }]}>
              Select Quantity
            </Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityValue, { color: Colors.light.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionTitle, { color: Colors.light.text }]}>
              Product Description
            </Text>
            <Text style={[styles.descriptionText, { color: Colors.light.text }]}>
              {product.description}
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🛡️</Text>
              <Text style={[styles.infoText, { color: Colors.light.text }]}>{product.warranty}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>↩️</Text>
              <Text style={[styles.infoText, { color: Colors.light.text }]}>
                {product.returnDays} Days Return
              </Text>
            </View>
          </View>

          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={[styles.relatedTitle, { color: Colors.light.text }]}>
                You May Also Like
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
              contentContainerStyle={styles.relatedContent}
            >
              {relatedProducts.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Blinkit-style Cart Bar */}
      <Animated.View
        style={[styles.cartBar, { transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity style={styles.cartBarInner} onPress={() => router.push('/(tabs)/cart')}>
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} added
            </Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarPrice}>₹{totalCartPrice.toFixed(0)}</Text>
            <Text style={styles.cartBarAction}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  topBar: { height: 12, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { fontSize: 24, fontWeight: '600', color: Colors.light.text },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { fontSize: 18 },
  badgeContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  deliveryBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  deliveryBadgeText: { color: 'white', fontSize: 12, fontWeight: '800' },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  productImage: { width: '80%', height: '80%', resizeMode: 'contain' },
  imageDot: {
    position: 'absolute',
    bottom: 16,
    width: 24,
    height: 4,
    backgroundColor: '#0C63E4',
    borderRadius: 2,
  },
  infoSection: { paddingHorizontal: 16 },
  brand: { fontSize: 11, color: '#0C63E4', fontWeight: '800', marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' },
  productName: { fontSize: 24, fontWeight: '800', marginBottom: 14, lineHeight: 32, color: '#1a1a2e' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingStars: { fontSize: 14 },
  reviews: { fontSize: 12, color: '#999' },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  price: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
  originalPrice: { fontSize: 14, color: '#ccc', textDecorationLine: 'line-through', fontWeight: '600' },
  discount: { fontSize: 12, fontWeight: '800', color: '#FF4757' },
  deliveryBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#e0e8ff',
    elevation: 1,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  deliveryIcon: { fontSize: 32 },
  deliveryTextContainer: { flex: 1 },
  deliveryTitle: { fontSize: 11, fontWeight: '800', color: '#0C63E4', marginBottom: 4, letterSpacing: 0.3 },
  deliveryTime: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  deliverySubtext: { fontSize: 11, color: '#999', fontWeight: '500' },
  deliveryArrow: { fontSize: 20, color: '#0C63E4' },
  quantitySection: { marginBottom: 20 },
  quantityLabel: { fontSize: 15, fontWeight: '800', marginBottom: 14, color: '#1a1a2e' },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 130,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quantityButtonText: { fontSize: 22, fontWeight: '800', color: '#0C63E4' },
  quantityValue: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  descriptionSection: { marginBottom: 24 },
  descriptionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, color: '#1a1a2e' },
  descriptionText: { fontSize: 13, lineHeight: 20, marginBottom: 10, color: '#666' },
  readMore: { fontSize: 13, color: '#0C63E4', fontWeight: '800' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  infoItem: { alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 20 },
  infoText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  relatedSection: { marginBottom: 20 },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  seeAll: { fontSize: 12, color: '#0C63E4', fontWeight: '800' },
  relatedScroll: { marginHorizontal: -16 },
  relatedContent: { paddingHorizontal: 16, gap: 12 },
  relatedCard: {
    width: 120,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  relatedImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  relatedPriceRow: { width: '100%', alignItems: 'center', gap: 6 },
  relatedPrice: { fontSize: 13, fontWeight: '800', color: '#22C55E' },
  relatedRating: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  relatedRatingText: { fontSize: 10, fontWeight: '700', color: '#1a1a2e' },

  // Cart bar (Blinkit style)
  cartBar: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
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
    backgroundColor: '#0C63E4',
    borderRadius: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cartBadgeText: { color: 'white', fontSize: 14, fontWeight: '800' },
  cartBarLabel: { color: '#fff', fontSize: 14, fontWeight: '700', color: '#f5f5f5' },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarPrice: { color: '#fff', fontSize: 15, fontWeight: '800' },
  cartBarAction: { color: '#0C63E4', fontSize: 13, fontWeight: '800', marginTop: 2 },

  // Action buttons
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buyNowButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#0C63E4',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: { color: '#0C63E4', fontSize: 15, fontWeight: '800' },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#0C63E4',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addToCartText: { color: 'white', fontSize: 15, fontWeight: '800' },
});
