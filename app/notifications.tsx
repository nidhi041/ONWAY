import { Colors } from '@/constants/theme';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Notification {
  id: string;
  type: 'order' | 'offer' | 'delivery' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'delivery',
    title: 'Delivery Update',
    message: 'Your order is on the way. Expected delivery: Today by 6 PM',
    timestamp: '2 hours ago',
    isRead: false,
    icon: '🚚',
  },
  {
    id: '2',
    type: 'offer',
    title: 'Special Offer',
    message: 'Get 30% off on all beverages today. Use code: DRINK30',
    timestamp: '5 hours ago',
    isRead: false,
    icon: '🎉',
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Flash Sale',
    message: 'Limited time offers on snacks and drinks. Shop now!',
    timestamp: '1 day ago',
    isRead: true,
    icon: '⚡',
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed. Order ID: ONW-12345',
    timestamp: '2 days ago',
    isRead: true,
    icon: '✅',
  },
];

const NotificationCard = ({
  notification,
  onDelete,
  onMarkAsRead,
}: {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}) => (
  <TouchableOpacity
    style={[
      styles.notificationCard,
      !notification.isRead && styles.notificationCardUnread,
    ]}
    onPress={() => onMarkAsRead(notification.id)}
  >
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.notificationIcon}>{notification.icon}</Text>
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.notificationTitle,
              { color: Colors.light.text },
              !notification.isRead && styles.titleBold,
            ]}
          >
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.timestamp}>{notification.timestamp}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(notification.id)}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(
    DEFAULT_NOTIFICATIONS
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotifications(notifications.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: () => {
          setNotifications([]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Top Info Bar */}
          <View style={styles.infoBar}>
            <View>
              <Text style={[styles.totalText, { color: Colors.light.text }]}>
                {notifications.length} Notifications
              </Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadText}>{unreadCount} unread</Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.infoButtonText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity
                  style={[styles.infoButton, styles.infoButtonDanger]}
                  onPress={handleClearAll}
                >
                  <Text style={styles.infoButtonTextDanger}>Clear all</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <View style={styles.notificationsContainer}>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDelete={handleDelete}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
                No Notifications
              </Text>
              <Text style={styles.emptySubtitle}>
                You're all caught up! Check back later for updates
              </Text>
            </View>
          )}
        </View>

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
  contentContainer: {
    paddingVertical: 12,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
  },
  unreadText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  infoButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#35aeff',
  },
  infoButtonDanger: {
    backgroundColor: '#f5f5f5',
  },
  infoButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  infoButtonTextDanger: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  notificationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#f0f8ff',
    borderLeftColor: '#35aeff',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  titleBold: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#35aeff',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 32,
  },
  bottomSpacing: {
    height: 20,
  },
});
