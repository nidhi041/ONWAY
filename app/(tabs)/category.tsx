import { Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useFirestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

type SortOption = 'popularity' | 'price-low' | 'price-high' | 'rating';
type FilterOption = 'all' | 'price-low-high' | 'rating-40' | 'fast-deliver';

const ProductCard = ({ product, onPress, onAddToCart }: { product: Product; onPress?: () => void; onAddToCart?: () => void }) => {
  const imageSource = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/ProductImage/red-bull.avif');
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <RNImage source={imageSource} style={styles.productImage} />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeText}>⭐ {product.rating}</Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>
        <Text style={styles.taxText}>Incl. Taxes</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function CategoryScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const params = useLocalSearchParams();
  const categoryName = (params.name as string) || 'grocery';
  const { products: allProducts, loading } = useProducts();
  const [activeFilter] = useState<FilterOption>('all');
  const [sortBy] = useState<SortOption>('popularity');
  const [products, setProducts] = useState<Product[]>([]);

  // Filter products by category from Firestore
  useEffect(() => {
    const filteredProducts = allProducts.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );
    setProducts(filteredProducts);
  }, [allProducts, categoryName]);

  const filterOptions: FilterOption[] = ['all', 'price-low-high', 'rating-40', 'fast-deliver'];
  const filterLabels: Record<FilterOption, string> = {
    all: 'All',
    'price-low-high': 'Price: Low to High',
    'rating-40': 'Rating 4.0+',
    'fast-deliver': 'Fast Deliver',
  };

  const sortOptions: SortOption[] = ['popularity', 'price-low', 'price-high', 'rating'];
  const sortLabels: Record<SortOption, string> = {
    popularity: 'Popularity',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    rating: 'Highest Rated',
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#35aeff" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
              {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
            </Text>
            <TouchableOpacity>
              <Text style={styles.filterIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filterLabels[filter]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Showing items count */}
          <View style={styles.countContainer}>
            <Text style={[styles.countText, { color: Colors.light.text }]}>
              Showing {products.length} items
            </Text>
          </View>

          {/* Sort dropdown */}
          <View style={styles.sortContainer}>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortLabel}>Sort by: {sortLabels[sortBy]}</Text>
              <Text style={styles.sortDropdown}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Product Grid */}
          <View style={styles.gridContainer}>
            <FlatList
              data={products}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
                  onAddToCart={() => addToCart(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContent}
            />
          </View>

          {/* Bottom spacer for nav bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  topBar: {
    height: 12,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  filtersScroll: {
    marginTop: 14,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filtersContent: {
    paddingHorizontal: 0,
    gap: 10,
    paddingBottom: 14,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  filterChipActive: {
    backgroundColor: '#0C63E4',
    borderColor: '#0C63E4',
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: 'white',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C63E4',
    marginRight: 8,
  },
  sortDropdown: {
    fontSize: 10,
    color: '#0C63E4',
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  gridContent: {
    gap: 0,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22C55E',
  },
  originalPrice: {
    fontSize: 11,
    color: '#ccc',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  taxText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#0C63E4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
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
  bottomSpacer: {
    height: 30,
  },
});
