import { getProductById, Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ImageSourcePropType,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: ImageSourcePropType;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const MOCK_RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: '1',
    name: 'Travel Case',
    price: 24.99,
    rating: 4.5,
    image: require('@/assets/ProductImage/paracetamol.jpg'),
  },
  {
    id: '2',
    name: 'Fast Charger',
    price: 19.99,
    rating: 4.7,
    image: require('@/assets/ProductImage/sarash milk.avif'),
  },
  {
    id: '3',
    name: 'Audio Cable',
    price: 9.99,
    rating: 4.3,
    image: require('@/assets/ProductImage/Hand senitizer.jpg'),
  },
];

const RelatedProductCard = ({ product }: { product: RelatedProduct }) => (
  <TouchableOpacity style={styles.relatedCard}>
    <RNImage source={product.image} style={styles.relatedImage} />
    <Text style={styles.relatedName}>{product.name}</Text>
    <View style={styles.relatedPriceRow}>
      <Text style={styles.relatedPrice}>₹{product.price}</Text>
      <View style={styles.relatedRating}>
        <Text style={styles.relatedRatingText}>⭐ {product.rating}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    const productId = params.id as string;
    if (productId) {
      const foundProduct = getProductById(productId);
      if (foundProduct) setProduct(foundProduct);
    }
  }, [params.id]);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <Text style={{ color: Colors.light.text, textAlign: 'center', marginTop: 50 }}>
          Product not found
        </Text>
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
          <RNImage source={product.image} style={styles.productImage} />
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
              {MOCK_RELATED_PRODUCTS.map((item) => (
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { fontSize: 18 },
  badgeContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  deliveryBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  deliveryBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
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
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  infoSection: { paddingHorizontal: 16 },
  brand: { fontSize: 11, color: '#2196F3', fontWeight: '700', marginBottom: 4 },
  productName: { fontSize: 22, fontWeight: '700', marginBottom: 12, lineHeight: 28 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingStars: { fontSize: 14 },
  reviews: { fontSize: 12, color: '#999' },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '700', color: '#2196F3' },
  originalPrice: { fontSize: 14, color: '#ccc', textDecorationLine: 'line-through' },
  discount: { fontSize: 12, fontWeight: '600', color: '#666' },
  deliveryBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIcon: { fontSize: 28 },
  deliveryTextContainer: { flex: 1 },
  deliveryTitle: { fontSize: 11, fontWeight: '700', color: '#2196F3', marginBottom: 2 },
  deliveryTime: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 2 },
  deliverySubtext: { fontSize: 11, color: '#666' },
  deliveryArrow: { fontSize: 20, color: '#2196F3' },
  quantitySection: { marginBottom: 20 },
  quantityLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 120,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  quantityValue: { fontSize: 16, fontWeight: '600' },
  descriptionSection: { marginBottom: 20 },
  descriptionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  descriptionText: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  readMore: { fontSize: 12, color: '#2196F3', fontWeight: '600' },
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
  relatedTitle: { fontSize: 14, fontWeight: '700' },
  seeAll: { fontSize: 12, color: '#2196F3', fontWeight: '600' },
  relatedScroll: { marginHorizontal: -16 },
  relatedContent: { paddingHorizontal: 16, gap: 12 },
  relatedCard: {
    width: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  relatedImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  relatedName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 13,
  },
  relatedPriceRow: { width: '100%', alignItems: 'center', gap: 4 },
  relatedPrice: { fontSize: 12, fontWeight: '700', color: '#E53935' },
  relatedRating: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  relatedRatingText: { fontSize: 10, fontWeight: '600', color: Colors.light.text },

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
    borderColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: { color: '#2196F3', fontSize: 14, fontWeight: '700' },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: { color: 'white', fontSize: 14, fontWeight: '700' },
});
