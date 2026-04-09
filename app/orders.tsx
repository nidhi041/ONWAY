import { PRODUCTS } from '@/constants/products';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
    FlatList,
    Image,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: number;
}

interface Order {
  id: string;
  title: string;
  price: number;
  date: string;
  time: string;
  status: 'Arrived' | 'In Transit' | 'Processing' | 'Cancelled';
  deliveryTime: number; // in minutes
  items: OrderItem[];
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    title: 'Arrived in 10 minutes',
    price: 297,
    date: '19 Feb',
    time: '8:30 pm',
    status: 'Arrived',
    deliveryTime: 10,
    items: [
      {
        id: 'item1',
        name: PRODUCTS[1].name,
        image: PRODUCTS[5].image,
        price: 297,
      },
    ],
  },
  {
    id: '2',
    title: 'Arrived in 7 minutes',
    price: 509,
    date: '14 Feb',
    time: '4:15 pm',
    status: 'Arrived',
    deliveryTime: 7,
    items: [
      {
        id: 'item1',
        name: PRODUCTS[0].name,
        image: PRODUCTS[0].image,
        price: 509,
      },
    ],
  },
  {
    id: '3',
    title: 'Arrived in 8 minutes',
    price: 741,
    date: '04 Sep 2025',
    time: '',
    status: 'Arrived',
    deliveryTime: 8,
    items: [
      {
        id: 'item1',
        name: PRODUCTS[0].name,
        image: PRODUCTS[0].image,
        price: 150,
      },
      {
        id: 'item2',
        name: PRODUCTS[1].name,
        image: PRODUCTS[4].image,
        price: 200,
      },
      {
        id: 'item3',
        name: PRODUCTS[2]?.name || 'Product',
        image: PRODUCTS[2]?.image || PRODUCTS[1].image,
        price: 150,
      },
      {
        id: 'item4',
        name: PRODUCTS[3]?.name || 'Product',
        image: PRODUCTS[3]?.image || PRODUCTS[1].image,
        price: 150,
      },
      {
        id: 'item5',
        name: PRODUCTS[4]?.name || 'Product',
        image: PRODUCTS[4]?.image || PRODUCTS[1].image,
        price: 91,
      },
    ],
  },
  {
    id: '4',
    title: 'Arrived in 7 minutes',
    price: 267,
    date: '22 Aug 2025',
    time: '',
    status: 'Arrived',
    deliveryTime: 7,
    items: [
      {
        id: 'item1',
        name: PRODUCTS[1].name,
        image: PRODUCTS[2].image,
        price: 267,
      },
    ],
  },
];

const OrderItemImage = ({ item }: { item: OrderItem }) => (
  <View style={styles.itemImageContainer}>
    <View style={styles.itemImageBox}>
      <Image
        source={item.image}
        style={styles.itemImageSource}
        resizeMode="cover"
      />
    </View>
  </View>
);

const OrderCard = ({ order }: { order: Order }) => (
  <View style={styles.orderCard}>
    {/* Top Section with Status and Menu */}
    <View style={styles.cardTopSection}>
      <View style={styles.statusSection}>
        <View style={styles.statusBadge}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.titleSection}>
          <Text style={[styles.orderTitle, { color: Colors.light.text }]}>
            {order.title}
          </Text>
          <Text style={styles.orderMeta}>
            ₹{order.price} • {order.date}{order.time ? `, ${order.time}` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>
    </View>

    {/* Product Images Section */}
    <View style={styles.productsSection}>
      <FlatList
        data={order.items}
        renderItem={({ item }) => <OrderItemImage item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEnabled={order.items.length > 4}
        showsHorizontalScrollIndicator={false}
      />
    </View>

    {/* Action Buttons */}
    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButtonGreen}>
        <Text style={styles.actionTextGreen}>Reorder</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButtonGreen}>
        <Text style={styles.actionTextGreen}>Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_ORDERS.length > 0 ? (
          <View style={styles.ordersContainer}>
            {MOCK_ORDERS.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
              No Orders Yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Start shopping to create your first order
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.exploreButtonText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  ordersContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusSection: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: '700',
  },
  titleSection: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderMeta: {
    fontSize: 13,
    color: '#999',
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#999',
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImageSource: {
    width: '100%',
    height: '100%',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonGreen: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextGreen: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#35aeff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
