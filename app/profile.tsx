import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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
    backgroundColor: '#35aeff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    borderWidth: 2,
    borderColor: '#35aeff',
  },
  signupButtonText: {
    color: '#35aeff',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#E3F2FD',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  memberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E3F2FD',
  },
  memberBadgeText: {
    fontSize: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  statBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '700',
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 11,
    color: '#999',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
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
    paddingVertical: 12,
    backgroundColor: '#FFEBEE',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53935',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    color: '#ccc',
  },
  bottomSpacing: {
    height: 20,
  },
});
