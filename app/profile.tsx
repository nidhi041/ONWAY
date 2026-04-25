import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string | number;
  onPress?: () => void;
}

const ACTIVITY_ITEMS: MenuItem[] = [
  {
    id: '1',
    icon: '📦',
    title: 'My Orders',
    description: 'Track, reorder, or return items',
  },
  {
    id: '2',
    icon: '📍',
    title: 'Saved Addresses',
    description: 'Home, Work, and other places',
  },
  {
    id: '3',
    icon: '💳',
    title: 'Payment Methods',
    description: 'Manage cards and UPI IDs',
  },
];

const PRIVACY_ITEMS: MenuItem[] = [
  {
    id: '4',
    icon: '🔔',
    title: 'Notifications',
    description: 'Offers and delivery updates',
    badge: 3,
  },
  {
    id: '5',
    icon: '🛡️',
    title: 'Privacy & Security',
    description: 'Password and account safety',
  },
];

const SUPPORT_ITEMS: MenuItem[] = [
  {
    id: '6',
    icon: '❓',
    title: 'Help & Support',
    description: 'Get 24/7 assistance',
  },
];

const MenuItemRow = ({ item, onPress }: { item: MenuItem; onPress?: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuIcon}>{item.icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: Colors.light.text }]}>
          {item.title}
        </Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  const handleActivityItemPress = (id: string) => {
    switch (id) {
      case '1':
        router.push('/orders');
        break;
      case '2':
        router.push('/saved-addresses');
        break;
      case '3':
        router.push('/payment-methods');
        break;
      case '4':
        router.push('/notifications');
        break;
      case '5':
        router.push('/privacy-security');
        break;
      case '6':
        router.push('/help-support');
        break;
      default:
        break;
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emptyContentContainer}
        >
          {/* Empty State */}
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
              Not Logged In
            </Text>
            <Text style={styles.emptySubtitle}>
              Sign in to your account to view your profile, orders, and more
            </Text>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.emptyFooter}>
              <Text style={styles.footerText}>MADE WITH ❤️ FOR ONWAY</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
            My Profile
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatarContainer}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/arun_eagwnh.jpg' }}
              style={styles.profileAvatar}
            />
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>⭐</Text>
            </View>
          </View>

          <Text style={[styles.profileName, { color: Colors.light.text }]}>
            {user?.name}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>Member</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>Active User</Text>
            </View>
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            ACTIVITY
          </Text>
          {ACTIVITY_ITEMS.map((item) => (
            <MenuItemRow 
              key={item.id} 
              item={item} 
              onPress={() => handleActivityItemPress(item.id)}
            />
          ))}
        </View>

        {/* Account & Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            ACCOUNT & PRIVACY
          </Text>
          {PRIVACY_ITEMS.map((item) => (
            <MenuItemRow 
              key={item.id} 
              item={item} 
              onPress={() => handleActivityItemPress(item.id)}
            />
          ))}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            SUPPORT
          </Text>
          {SUPPORT_ITEMS.map((item) => (
            <MenuItemRow 
              key={item.id} 
              item={item} 
              onPress={() => handleActivityItemPress(item.id)}
            />
          ))}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutItem}
            onPress={() => {
              logout();
              router.replace('/profile');
            }}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>MADE WITH ❤️ FOR ONWAY</Text>
          <Text style={styles.versionText}>App Version 2.4.1 (Stable Build)</Text>
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
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#0C63E4',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
    elevation: 3,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    borderWidth: 2,
    borderColor: '#0C63E4',
    elevation: 1,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  signupButtonText: {
    color: '#0C63E4',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyFooter: {
    alignItems: 'center',
    marginTop: 24,
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileSection: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e8ff',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#0C63E4',
  },
  memberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f0f8ff',
    elevation: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  memberBadgeText: {
    fontSize: 14,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#0C63E4',
    elevation: 1,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statBadgeText: {
    fontSize: 12,
    color: '#0C63E4',
    fontWeight: '800',
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    letterSpacing: 0.5,
    color: '#1a1a2e',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    color: '#1a1a2e',
  },
  menuDescription: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF4757',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  logoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0e0',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF4757',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 10,
    color: '#ccc',
  },
  bottomSpacing: {
    height: 20,
  },
});
