import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

interface OrderStatus {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  current: boolean;
}

const ORDER_STATUSES: OrderStatus[] = [
  {
    id: '1',
    title: 'Order Confirmed',
    time: '12:15 PM',
    completed: true,
    current: false,
  },
  {
    id: '2',
    title: 'Preparing your order',
    time: '12:22 PM',
    completed: true,
    current: false,
  },
  {
    id: '3',
    title: 'Out for Delivery',
    time: '12:30 PM',
    completed: true,
    current: true,
  },
  {
    id: '4',
    title: 'Arriving at your location',
    time: 'ETA 12:45 PM',
    completed: false,
    current: false,
  },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
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
            Order Tracking
          </Text>
          <TouchableOpacity>
            <Text style={styles.infoIcon}>ⓘ</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status Card */}
        <View style={styles.orderStatusCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>ORDER #ONW-88291</Text>
              <View style={styles.orderTimeContainer}>
                <Text style={styles.orderTimeIcon}>⏰</Text>
                <Text style={styles.orderTime}>Estimated Delivery: 12:45 PM</Text>
              </View>
            </View>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live</Text>
            </View>
          </View>

          {/* Rider Distance */}
          <View style={styles.riderDistance}>
            <Text style={styles.riderDistanceText}>Rider is 1.2km away</Text>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>📍 Map View</Text>
            <Text style={styles.mapSubtext}>ONWAY Store → Your Location</Text>
            <View style={styles.mapIcons}>
              <Text style={styles.mapStoreIcon}>🏪</Text>
              <Text style={styles.mapRiderIcon}>🛵</Text>
              <Text style={styles.mapHomeIcon}>🏠</Text>
            </View>
          </View>
        </View>

        {/* View Full Details Button */}
        <View style={styles.fullDetailsButton}>
          <TouchableOpacity style={styles.fullDetailsContainer}>
            <Text style={styles.fullDetailsText}>View Full Order Details</Text>
            <Text style={styles.fullDetailsArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Arrival Time */}
        <View style={styles.arrivalSection}>
          <Text style={styles.arrivalTimeLabel}>Arriving in</Text>
          <Text style={styles.arrivalTime}>12 mins</Text>
          <Text style={[styles.arrivalSubtext, { color: Colors.light.text }]}>
            Michael is on his way with your order
          </Text>
        </View>

        {/* Rider Information Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderHeader}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>👤</Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={[styles.riderName, { color: Colors.light.text }]}>
                Michael Rodriguez
              </Text>
              <Text style={styles.riderVehicle}>Honda Activa - ABC-1234</Text>
              <View style={styles.riderRating}>
                <Text style={styles.ratingStars}>⭐ 4.9</Text>
                <Text style={styles.ratingCount}>(2.4k orders)</Text>
              </View>
            </View>
            <View style={styles.riderStatus}>
              <View style={styles.riderOnlineIndicator} />
            </View>
          </View>
          <View style={styles.riderActions}>
            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: Colors.light.text }]}>
              Order Progress
            </Text>
            {isRefreshing && (
              <Text style={styles.refreshingText}>REFRESHING...</Text>
            )}
          </View>

          <View style={styles.progressTimeline}>
            {ORDER_STATUSES.map((status, index) => (
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
                    {index < ORDER_STATUSES.length - 1 && (
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
                    <Text style={styles.timelineTime}>{status.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>↗️</Text>
            <Text style={styles.shareText}>Share Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
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
  liveBadge: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2196F3',
  },
  riderDistance: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  riderDistanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  mapPlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  mapIcons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  mapStoreIcon: {
    fontSize: 28,
  },
  mapRiderIcon: {
    fontSize: 28,
  },
  mapHomeIcon: {
    fontSize: 28,
  },
  fullDetailsButton: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  fullDetailsContainer: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  fullDetailsArrow: {
    fontSize: 18,
    color: 'white',
  },
  arrivalSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  arrivalTimeLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  arrivalTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  arrivalSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  riderCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  riderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderAvatarText: {
    fontSize: 24,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  riderVehicle: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  riderRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStars: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ratingCount: {
    fontSize: 10,
    color: '#999',
  },
  riderStatus: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderOnlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    fontSize: 18,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 18,
  },
  progressSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  refreshingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
  },
  shareIcon: {
    fontSize: 16,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E53935',
  },
  bottomSpacing: {
    height: 20,
  },
});
