import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/constants/products';
import { useProducts } from '@/hooks/useFirestore';
import { C, shadow } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Dimensions, FlatList, Image as RNImage, ScrollView,
    StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;
const CARD_W = (W - 40 - 12) / 2;

interface SearchSuggestion {
  id: string;
  text: string;
  icon: string;
}

const RECENT_SEARCHES: string[] = [
  'Paracetamol',
  'Hand Sanitizer',
  'Banana',
  'Chicken',
  'Rice',
];

const POPULAR = [
  { id: '1', text: 'Paracetamol', icon: '💊', color: '#EFF6FF' },
  { id: '2', text: 'Sanitizer',   icon: '🧴', color: '#EFF6FF' },
  { id: '3', text: 'Vitamin C',   icon: '🍊', color: '#F0FDFA' },
  { id: '4', text: 'Bandage',     icon: '🩹', color: '#FFF1F2' },
  { id: '5', text: 'Cough Syrup',  icon: '🧪', color: '#FDF4FF' },
];

const CATS = [
  { id: '1', name: 'Pain Relief', icon: '💊', color: '#EFF6FF' },
  { id: '2', name: 'Cold & Flu',  icon: '🤧', color: '#EFF6FF' },
  { id: '3', name: 'Vitamins',    icon: '🍊', color: '#F0FDFA' },
  { id: '4', name: 'First Aid',   icon: '🩹', color: '#FFF1F2' },
  { id: '5', name: 'Digestive',   icon: '💚', color: '#F0FDFA' },
  { id: '6', name: 'Allergy',     icon: '🌸', color: '#FDF4FF' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { products: allProducts } = useProducts(undefined, undefined, false);

  // Load recent searches from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('recentSearches').then((val) => {
      if (val) setRecent(JSON.parse(val));
      else setRecent(RECENT_SEARCHES);
    }).catch(() => setRecent(RECENT_SEARCHES));
  }, []);

  const saveRecent = useCallback(async (term: string) => {
    setRecent(prev => {
      const updated = [term, ...prev.filter(r => r !== term)].slice(0, 8);
      AsyncStorage.setItem('recentSearches', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const search = useCallback((text: string) => {
    setQuery(text);
    // Clear existing debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    // Debounce 300ms — only search after user stops typing
    debounceRef.current = setTimeout(() => {
      const searchText = text.toLowerCase() === 'medicines' ? 'medicine' : text.toLowerCase();
      setResults(allProducts.filter(p => {
        const categoryMatch = Array.isArray(p.category) 
          ? p.category.some(c => c.toLowerCase().includes(searchText))
          : (p.category && p.category.toLowerCase().includes(searchText))

        return (
          p.name.toLowerCase().includes(searchText) ||
          (p.brand && p.brand.toLowerCase().includes(searchText)) ||
          categoryMatch
        );
      }));
    }, 300);
  }, [allProducts]);

  const selectSuggestion = useCallback((text: string) => {
    setQuery(text);
    saveRecent(text);
    const searchText = text.toLowerCase() === 'medicines' ? 'medicine' : text.toLowerCase();
    setResults(allProducts.filter(p => {
      const categoryMatch = Array.isArray(p.category)
        ? p.category.some(c => c.toLowerCase().includes(searchText))
        : (p.category && p.category.toLowerCase().includes(searchText))

      return (
        p.name.toLowerCase().includes(searchText) ||
        (p.brand && p.brand.toLowerCase().includes(searchText)) ||
        categoryMatch
      );
    }));
  }, [allProducts, saveRecent]);

  const ResultCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={st.resultCard}
      onPress={() => router.push(`/product?id=${product.id}&name=${product.name}`)}
      activeOpacity={0.88}
    >
      <View style={st.resultImgBox}>
        <RNImage source={product.image} style={st.resultImg} resizeMode="cover" />
      </View>
      <View style={st.resultBody}>
        <Text style={st.resultBrand}>{product.brand}</Text>
        <Text style={st.resultName} numberOfLines={2}>{product.name}</Text>
        <View style={st.resultPriceRow}>
          <Text style={st.resultPrice}>₹{product.price}</Text>
          <Text style={st.resultRating}>★ {product.rating}</Text>
        </View>
        <AddToCartButton product={product} size="small" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Search bar */}
      <View style={st.searchWrap}>
        <View style={st.searchBar}>
          <Text style={st.searchIcon}>🔍</Text>
          <TextInput
            style={st.searchInput}
            placeholder="Search medicines, vitamins, health products…"
            placeholderTextColor={C.inkMuted}
            value={query}
            onChangeText={search}
            returnKeyType="search"
            autoFocus={false}
          />
          {query ? (
            <TouchableOpacity
              style={st.clearBtn}
              onPress={() => { setQuery(''); setResults([]); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={st.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results */}
      {query && results.length > 0 ? (
        <View style={{ flex: 1 }}>
          <Text style={st.resultsLabel}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Text>
          <FlatList
            data={results}
            renderItem={({ item }) => <ResultCard product={item} />}
            keyExtractor={i => i.id}
            numColumns={2}
            columnWrapperStyle={st.resultGrid}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : query && results.length === 0 ? (
        <View style={st.empty}>
          <View style={st.emptyIconBox}><Text style={st.emptyIcon}>🔍</Text></View>
          <Text style={st.emptyTitle}>No results found</Text>
          <Text style={st.emptySub}>Try different keywords or browse categories below</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Popular */}
          <View style={st.section}>
            <Text style={st.sectionTitle}>Popular Searches</Text>
            <View style={st.pillsWrap}>
              {POPULAR.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[st.pill, { backgroundColor: p.color }]}
                  onPress={() => selectSuggestion(p.text)}
                  activeOpacity={0.75}
                >
                  <Text style={st.pillIcon}>{p.icon}</Text>
                  <Text style={st.pillText}>{p.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent */}
          {recent.length > 0 && (
            <View style={st.section}>
              <View style={st.sectionRow}>
                <Text style={st.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => setRecent([])} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={st.clearAll}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={st.recentCard}>
                {recent.map((r, i) => (
                  <View key={i}>
                    <TouchableOpacity style={st.recentRow} onPress={() => selectSuggestion(r)} activeOpacity={0.7}>
                      <View style={st.recentIconBox}><Text style={st.recentIcon}>⏱</Text></View>
                      <Text style={st.recentText}>{r}</Text>
                      <Text style={st.recentArrow}>›</Text>
                    </TouchableOpacity>
                    {i < recent.length - 1 && <View style={st.recentDivider} />}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          <View style={st.section}>
            <Text style={st.sectionTitle}>Browse by Category</Text>
            <View style={st.catsGrid}>
              {CATS.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[st.catBox, { backgroundColor: c.color }]}
                  onPress={() => router.push(`/(tabs)/category?name=${c.name}`)}
                  activeOpacity={0.8}
                >
                  <Text style={st.catIcon}>{c.icon}</Text>
                  <Text style={st.catName}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  searchWrap: {
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: C.bg,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 14, height: 50,
    borderWidth: 1.5, borderColor: C.border,
    ...shadow('sm'),
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, padding: 0, fontWeight: '500' },
  clearBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center',
  },
  clearIcon: { fontSize: 10, color: C.inkSub, fontWeight: '700' },

  resultsLabel: { fontSize: 12, color: C.inkMuted, paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },
  resultGrid: { gap: 12, justifyContent: 'space-between', marginBottom: 12 },
  resultCard: {
    width: CARD_W, backgroundColor: C.surface, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  resultImgBox: { backgroundColor: C.surfaceAlt },
  resultImg: { width: '100%', height: 130 },
  resultBody: { padding: 10 },
  resultBrand: { fontSize: 9, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  resultName: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 6, lineHeight: 18 },
  resultPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultPrice: { fontSize: 14, fontWeight: '800', color: C.blue },
  resultRating: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },

  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 14 },
  clearAll: { fontSize: 12, color: C.error, fontWeight: '600' },

  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  pillIcon: { fontSize: 15 },
  pillText: { fontSize: 13, color: C.inkSub, fontWeight: '600' },

  recentCard: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    ...shadow('sm'),
  },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  recentIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  recentIcon: { fontSize: 14 },
  recentText: { flex: 1, fontSize: 14, color: C.inkSub, fontWeight: '500' },
  recentArrow: { fontSize: 18, color: C.inkLight },
  recentDivider: { height: 1, backgroundColor: C.borderLight, marginLeft: 58 },

  catsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBox: {
    width: (W - 40 - 20) / 3, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  catIcon: { fontSize: 26 },
  catName: { fontSize: 11, fontWeight: '600', color: C.inkSub, textAlign: 'center' },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.blueLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.ink, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.inkMuted, textAlign: 'center', lineHeight: 20 },
});
