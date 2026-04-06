import { PRODUCTS, Product } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SearchSuggestion {
  id: string;
  text: string;
  icon: string;
}

const POPULAR_SEARCHES: SearchSuggestion[] = [
  { id: '1', text: 'Milk', icon: '🥛' },
  { id: '2', text: 'Bread', icon: '🍞' },
  { id: '3', text: 'Eggs', icon: '🥚' },
  { id: '4', text: 'Fruits', icon: '🍎' },
  { id: '5', text: 'Vegetables', icon: '🥦' },
  { id: '6', text: 'Coffee', icon: '☕' },
];

const RECENT_SEARCHES: string[] = [
  'Paracetamol',
  'Hand Sanitizer',
  'Banana',
  'Chicken',
  'Rice',
];

const SEARCH_CATEGORIES = [
  { id: '1', name: 'Groceries', icon: '🛒' },
  { id: '2', name: 'Medicine', icon: '💊' },
  { id: '3', name: 'Beauty', icon: '💄' },
  { id: '4', name: 'Electronics', icon: '📱' },
  { id: '5', name: 'Clothing', icon: '👕' },
  { id: '6', name: 'Home & Kitchen', icon: '🏠' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleSearch = useCallback((text: string) => {
    if (text.trim()) {
      // Add to recent searches
      if (!recentSearches.includes(text)) {
        setRecentSearches([text, ...recentSearches.slice(0, 4)]);
      }
      
      // Filter products based on search text
      const results = PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase()) ||
        product.brand?.toLowerCase().includes(text.toLowerCase()) ||
        product.category.toLowerCase().includes(text.toLowerCase()) ||
        product.description?.toLowerCase().includes(text.toLowerCase())
      );
      
      setSearchResults(results);
      setSearchText(text);
    }
  }, [recentSearches]);

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  // Product Card Component for search results
  const SearchResultCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.searchResultCard}
      onPress={() => router.push(`/product?id=${product.id}&name=${product.name}`)}
    >
      <RNImage source={product.image} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultBrand}>{product.brand}</Text>
        <Text style={[styles.resultName, { color: Colors.light.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.resultPriceRow}>
          <Text style={styles.resultPrice}>₹{product.price}</Text>
          <Text style={styles.resultRating}>⭐ {product.rating}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.resultAddButton} onPress={() => addToCart(product)}>
        <Text style={styles.resultAddButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {searchText && searchResults.length > 0 ? (
        // Show Search Results
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsCountText, { color: Colors.light.text }]}>
            Found {searchResults.length} products
          </Text>
          <FlatList
            data={searchResults}
            renderItem={({ item }) => <SearchResultCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.resultGrid}
            scrollEnabled={true}
            contentContainerStyle={styles.resultContent}
          />
        </View>
      ) : searchText && searchResults.length === 0 ? (
        // No Results Found
        <ScrollView style={styles.scrollView}>
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsEmoji}>🔍</Text>
            <Text style={[styles.noResultsText, { color: Colors.light.text }]}>
              No products found
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        </ScrollView>
      ) : (
        // Show Popular Searches, Recent Searches, and Categories
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              Popular Searches
            </Text>
            <View style={styles.suggestionsGrid}>
              {POPULAR_SEARCHES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionChip}
                  onPress={() => handleSearch(item.text)}
                >
                  <Text style={styles.suggestionIcon}>{item.icon}</Text>
                  <Text style={styles.suggestionText}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.recentHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={handleClearRecent}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleSearch(search)}
                >
                  <Text style={styles.recentIcon}>⏱️</Text>
                  <Text style={[styles.recentText, { color: Colors.light.text }]}>
                    {search}
                  </Text>
                  <Text style={styles.recentArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Search Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              Browse by Category
            </Text>
            <View style={styles.categoriesGrid}>
              {SEARCH_CATEGORIES.map((category) => (
                <TouchableOpacity key={category.id} style={styles.categoryBox}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[styles.categoryName, { color: Colors.light.text }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  topBar: {
    height: 12,
    backgroundColor: '#ffffff',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E8FF',
  },
  suggestionIcon: {
    fontSize: 16,
  },
  suggestionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '700',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  recentIcon: {
    fontSize: 16,
  },
  recentText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  recentArrow: {
    fontSize: 16,
    color: '#999',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryBox: {
    width: '31%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  // Search Results Styles
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  searchResultCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  resultImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F5F5',
    resizeMode: 'cover',
  },
  resultInfo: {
    padding: 10,
  },
  resultBrand: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '700',
    marginBottom: 4,
  },
  resultName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    height: 32,
  },
  resultPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  resultRating: {
    fontSize: 11,
    color: '#666',
  },
  resultAddButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultAddButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  resultGrid: {
    justifyContent: 'space-between',
  },
  resultContent: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  noResultsEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
