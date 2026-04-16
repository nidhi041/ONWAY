import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Order, listenToOrderDetails } from '@/services/ordersService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderStatus {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  current: boolean;
}

const getOrderTimeline = (order: Order | null): OrderStatus[] => {
  if (!order) return [];

  const getTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const statuses = [
    {
      id: '1',
      title: 'Order Confirmed',
      time: getTime(order.createdAt),
      completed: true,
      current: order.status === 'confirmed',
    },
    {
      id: '2',
      title: 'Processing',
      time: order.status === 'processing' ? 'Now' : '',
      completed: ['processing', 'shipped', 'in-transit', 'delivered'].includes(order.status),
      current: order.status === 'processing',
    },
    {
      id: '3',
      title: 'Shipped',
      time: order.status === 'shipped' ? 'Now' : '',
      completed: ['shipped', 'in-transit', 'delivered'].includes(order.status),
      current: order.status === 'shipped',
    },
    {
      id: '4',
      title: 'In Transit',
      time: order.status === 'in-transit' ? 'Now' : order.estimatedDelivery || '',
      completed: ['in-transit', 'delivered'].includes(order.status),
      current: order.status === 'in-transit',
    },
    {
      id: '5',
      title: 'Delivered',
      time: order.status === 'delivered' ? getTime(order.updatedAt) : '',
      completed: order.status === 'delivered',
      current: false,
    },
  ];

  return statuses;
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !orderId) {
      setError('Invalid order');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = listenToOrderDetails(
      user.id,
      orderId,
      (fetchedOrder) => {
        setOrder(fetchedOrder);
        setIsLoading(false);
        if (!fetchedOrder) {
          setError('Order not found');
        }
      },
      (err) => {
        console.error('Error loading order:', err);
        setError('Failed to load order');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, orderId]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
            Order Details
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: Colors.light.text }]}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity
            style={styles.backToOrdersButton}
            onPress={() => router.push('/orders')}
          >
            <Text style={styles.backToOrdersText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const timeline = getOrderTimeline(order);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'in-transit':
        return '#FF9800';
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
            Order Details
          </Text>
          <TouchableOpacity>
            <Text style={styles.infoIcon}>ⓘ</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status Card */}
        <View style={styles.orderStatusCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>ORDER #{orderId.substring(0, 8).toUpperCase()}</Text>
              <View style={styles.orderTimeContainer}>
                <Text style={styles.orderTimeIcon}>⏰</Text>
                <Text style={styles.orderTime}>
                  Estimated: {order.estimatedDelivery || 'Processing...'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemContent}>
                <Text
                  style={[styles.itemName, { color: Colors.light.text }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
              </View>
              <View style={styles.itemPrice}>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemAmount}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Delivery Address
          </Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={styles.addressContent}>
              <Text style={[styles.addressName, { color: Colors.light.text }]}>
                {order.shippingAddress.name}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
              <Text style={styles.phoneText}>{order.shippingAddress.phone}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Payment Method
          </Text>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentIcon}>
              {order.paymentMethod.type === 'upi'
                ? '📱'
                : order.paymentMethod.type === 'cards'
                ? '💳'
                : order.paymentMethod.type === 'cod'
                ? '💵'
                : '🏦'}
            </Text>
            <Text style={[styles.paymentLabel, { color: Colors.light.text }]}>
              {order.paymentMethod.label}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.light.text }]}>
              ₹{order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.light.text }]}>
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Tax
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.light.text }]}>
              ₹{order.tax.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabelBold, { color: Colors.light.text }]}>
              Total Amount
            </Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Order Progress
          </Text>
          <View style={styles.progressTimeline}>
            {timeline.map((status, index) => (
              <View key={status.id}>
                <View style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        status.completed && styles.timelineCircleCompleted,
                        status.current && styles.timelineCircleCurrent,
                      ]}
                    >
                      {status.completed && (
                        <Text style={styles.timelineCheckmark}>✓</Text>
                      )}
                    </View>
                    {index < timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          status.completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        { color: Colors.light.text },
                      ]}
                    >
                      {status.title}
                    </Text>
                    {status.time && (
                      <Text style={styles.timelineTime}>{status.time}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  infoIcon: {
    fontSize: 20,
    color: '#999',
  },
  orderStatusCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  orderTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderTimeIcon: {
    fontSize: 14,
  },
  orderTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 10,
    color: '#999',
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2196F3',
  },
  addressBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 10,
  },
  addressIcon: {
    fontSize: 20,
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  phoneText: {
    fontSize: 11,
    color: '#999',
  },
  paymentBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryLabelBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  progressTimeline: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
    position: 'relative',
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineCircleCompleted: {
    backgroundColor: '#2196F3',
  },
  timelineCircleCurrent: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  timelineCheckmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    left: 11,
  },
  timelineLineCompleted: {
    backgroundColor: '#2196F3',
  },
  timelineRight: {
    flex: 1,
    paddingTop: 2,
    paddingLeft: 12,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 11,
    color: '#999',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  backToOrdersButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  backToOrdersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 20,
  },
});
