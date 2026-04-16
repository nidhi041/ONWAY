import { Colors } from '@/constants/theme';
import { useOrders } from '@/context/OrdersContext';
import { Order } from '@/services/ordersService';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  // Format date from timestamp
  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'N/A';
    }
  };

  const getFormattedTime = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'in-transit':
        return '#FF9800';
      case 'confirmed':
      case 'processing':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'in-transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderTitle, { color: Colors.light.text }]}>
            {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
          </Text>
          <Text style={styles.orderDate}>
            {getFormattedDate(order.createdAt)} • {getFormattedTime(order.createdAt)}
          </Text>
        </View>
        <View style={styles.orderPrice}>
          <Text style={styles.priceAmount}>₹{order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {order.items.slice(0, 3).map((item, idx) => (
          <Text key={idx} style={styles.itemName} numberOfLines={1}>
            {item.name}
            {item.quantity > 1 && ` x${item.quantity}`}
            {idx < order.items.length - 1 && ', '}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.itemName}>and {order.items.length - 3} more...</Text>
        )}
      </View>

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(order.status)}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, isLoading, error } = useOrders();

  const handleOrderPress = (orderId: string) => {
    router.push(`/ordertracking?orderId=${orderId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors.light.text }]}>My Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} orders</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={[styles.loadingText, { color: Colors.light.text }]}>
            Loading orders...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: Colors.light.text }]}>
            {error}
          </Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
            No Orders Yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Start shopping and your orders will appear here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => handleOrderPress(item.id)}
            />
          )}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 32,
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 12,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  orderPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  itemsPreview: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  viewDetails: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '700',
  },
});
