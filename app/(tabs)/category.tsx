import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { Skeleton } from '@/components/ui/Skeleton';
import { C, Colors } from '@/constants/theme';
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

const ProductCard = ({ product, onPress }: { product: Product; onPress?: () => void }) => {
  const imageSource = product.imageUrl ? { uri: product.imageUrl } : product.image || require('@/assets/images/medicine.png');
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <RNImage source={imageSource} style={styles.productImage} resizeMode="cover" />
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
        <AddToCartButton product={product} />
      </View>
    </TouchableOpacity>
  );
};

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryName = (params.name as string) || 'Medicines';
  const { products: firestoreProducts, loading } = useProducts();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Use Firestore products directly
    const source = firestoreProducts;

    // Exact case-insensitive match on category
    let filtered = source.filter(
      (p) => p.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Apply filter chips
    if (activeFilter === 'price-low-high') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'rating-40') {
      filtered = filtered.filter((p) => p.rating >= 4.0);
    } else if (activeFilter === 'fast-deliver') {
      filtered = filtered.filter((p) => (p.deliveryTime ?? 99) <= 12);
    }

    // Apply sort
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    setProducts(filtered);
  }, [firestoreProducts, categoryName, activeFilter, sortBy]);

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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <View key={i} style={[styles.productCard, { padding: 12, borderWidth: 1, borderColor: '#f1f5f9' }]}>
                <Skeleton style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 12 }} />
                <Skeleton style={{ width: '80%', height: 14, marginBottom: 8 }} />
                <Skeleton style={{ width: '40%', height: 12, marginBottom: 12 }} />
                <Skeleton style={{ width: '100%', height: 36, borderRadius: 8 }} />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
              {categoryName}
            </Text>
            <View style={{ width: 24 }} />
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
                onPress={() => setActiveFilter(filter)}
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

          {/* Count + Sort row */}
          <View style={styles.metaRow}>
            <Text style={[styles.countText, { color: Colors.light.text }]}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChips}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
                  onPress={() => setSortBy(opt)}
                >
                  <Text style={[styles.sortChipText, sortBy === opt && styles.sortChipTextActive]}>
                    {sortLabels[opt]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Empty state */}
          {products.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                No items in "{categoryName}" match the selected filters.
              </Text>
            </View>
          )}

          {/* Product Grid */}
          {products.length > 0 && (
            <View style={styles.gridContainer}>
              <FlatList
                data={products}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onPress={() => router.push(`/product?id=${item.id}&name=${item.name}`)}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContent}
              />
            </View>
          )}

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
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
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
    backgroundColor: C.blue,
    borderColor: C.blue,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    minWidth: 60,
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortChipActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  sortChipTextActive: {
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: C.blueLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
    elevation: 0,
  },
  addButtonText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 30,
  },
});
