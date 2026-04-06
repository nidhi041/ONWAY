import { PRODUCTS, Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
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

const ProductCard = ({ product, onPress, onAddToCart }: { product: Product; onPress?: () => void; onAddToCart?: () => void }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      <RNImage source={product.image} style={styles.productImage} />
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

export default function CategoryScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const params = useLocalSearchParams();
  const categoryName = (params.name as string) || 'Medicine';

  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [products, setProducts] = useState<Product[]>([]);

  // Load products filtered by category
  useEffect(() => {
    const filteredProducts = PRODUCTS.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );
    setProducts(filteredProducts);
  }, [categoryName]);

  const handleFilterChange = useCallback((filter: FilterOption) => {
    setActiveFilter(filter);
    // TODO: Implement filter logic based on selected filter
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    // TODO: Implement sort logic based on selected sort
  }, []);

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
            {categoryName}
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
              onPress={() => handleFilterChange(filter)}
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
    marginTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filtersContent: {
    paddingHorizontal: 0,
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: 'white',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 8,
  },
  sortDropdown: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  originalPrice: {
    fontSize: 11,
    color: '#ccc',
    textDecorationLine: 'line-through',
  },
  taxText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 30,
  },
});
