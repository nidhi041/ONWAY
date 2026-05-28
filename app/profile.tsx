import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useProducts } from '@/hooks/useFirestore';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU = [
  { id: '1', icon: '📦', label: 'My Orders',          sub: 'Track, reorder, return',   color: '#EFF6FF', iconBg: '#DBEAFE' },
  { id: '2', icon: '📍', label: 'Saved Addresses',    sub: 'Home, Work & more',         color: '#FFF1F2', iconBg: '#FFE4E6' },
  { id: '3', icon: '💳', label: 'Payment Methods',    sub: 'Cards & UPI',               color: '#F0FDFA', iconBg: '#CCFBF1' },
  { id: '4', icon: '🔔', label: 'Notifications',      sub: 'Offers & updates',          color: '#FFFBEB', iconBg: '#FEF3C7', badge: 3 },
  { id: '5', icon: '🛡️', label: 'Privacy & Security', sub: 'Password & account safety', color: '#EFF6FF', iconBg: '#DBEAFE' },
  { id: '6', icon: '❓', label: 'Help & Support',     sub: '24/7 assistance',           color: '#F0FDFA', iconBg: '#CCFBF1' },
];

const ROUTES: Record<string, string> = {
  '1': '/orders', '2': '/saved-addresses', '3': '/payment-methods',
  '4': '/notifications', '5': '/privacy-security', '6': '/help-support',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  
  const savedCount = products.filter(p => p.rating >= 4.6).length.toString();
  const ordersCount = orders.length.toString();

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={st.container}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={st.guest}>
          <View style={st.guestIconBox}>
            <Text style={st.guestIcon}>👤</Text>
          </View>
          <Text style={st.guestTitle}>Not signed in</Text>
          <Text style={st.guestSub}>Sign in to access your orders, addresses, and health history</Text>
          <TouchableOpacity style={st.primaryBtn} onPress={() => router.push('/login')} activeOpacity={0.88}>
            <Text style={st.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.outlineBtn} onPress={() => router.push('/signup')} activeOpacity={0.88}>
            <Text style={st.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <Text style={st.headerTitle}>My Profile</Text>
        <TouchableOpacity style={st.editBtn} onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
          <Text style={st.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile hero */}
        <View style={st.profileHero}>
          <View style={st.avatarWrap}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/arun_eagwnh.jpg' }}
              style={st.avatar}
            />
            <View style={st.verifiedBadge}>
              <Text style={st.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={st.profileName}>{user?.name}</Text>
          <Text style={st.profileEmail}>{user?.email}</Text>
          <TouchableOpacity style={st.memberPill} onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
            <Text style={st.memberPillText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={st.statsCard}>
          {[
            { v: ordersCount, l: 'Orders', icon: '📦', route: '/orders' },
            { v: savedCount,  l: 'Saved',  icon: '❤️', route: '/saved-products' },
            { v: '240',l: 'Points', icon: '⭐', route: '#' },
          ].map((st2, i) => (
            <TouchableOpacity 
              key={st2.l} 
              style={[st.statCell, i < 2 && st.statCellBorder]}
              onPress={() => st2.route !== '#' ? router.push(st2.route as any) : null}
              activeOpacity={0.7}
            >
              <Text style={st.statIcon}>{st2.icon}</Text>
              <Text style={st.statVal}>{st2.v}</Text>
              <Text style={st.statLabel}>{st2.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu */}
        <View style={st.menuSection}>
          <Text style={st.menuSectionTitle}>Account</Text>
          <View style={st.menuCard}>
            {MENU.map((item, idx) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={st.menuRow}
                  onPress={() => router.push(ROUTES[item.id] as any)}
                  activeOpacity={0.75}
                >
                  <View style={[st.menuIconBox, { backgroundColor: item.iconBg }]}>
                    <Text style={st.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={st.menuText}>
                    <Text style={st.menuLabel}>{item.label}</Text>
                    <Text style={st.menuSub}>{item.sub}</Text>
                  </View>
                  <View style={st.menuRight}>
                    {item.badge ? (
                      <View style={st.badge}><Text style={st.badgeText}>{item.badge}</Text></View>
                    ) : null}
                    <Text style={st.arrow}>›</Text>
                  </View>
                </TouchableOpacity>
                {idx < MENU.length - 1 && <View style={st.menuDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={st.menuSection}>
          <TouchableOpacity
            style={st.logoutBtn}
            onPress={() => { logout(); router.replace('/profile'); }}
            activeOpacity={0.85}
          >
            <Text style={st.logoutIcon}>🚪</Text>
            <Text style={st.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={st.footer}>
          <Text style={st.footerText}>OnWay Healthcare · v2.4.1</Text>
          <Text style={st.footerSub}>Made with ❤️ for your health</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    backgroundColor: C.blueLight, borderWidth: 1, borderColor: C.blueMid,
  },
  editBtnText: { fontSize: 12, color: C.blue, fontWeight: '700' },

  profileHero: {
    alignItems: 'center', paddingVertical: 28,
    backgroundColor: C.surface, marginHorizontal: 20,
    borderRadius: 24, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: C.blue,
  },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.teal, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: C.surface,
  },
  verifiedIcon: { color: '#fff', fontSize: 12, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 4 },
  profileEmail: { fontSize: 13, color: C.inkMuted, marginBottom: 12 },
  memberPill: {
    backgroundColor: C.blueLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: C.blueMid,
  },
  memberPillText: { fontSize: 12, color: C.blue, fontWeight: '700' },

  statsCard: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    backgroundColor: C.surface, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 4 },
  statCellBorder: { borderRightWidth: 1, borderRightColor: C.borderLight },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statVal: { fontSize: 20, fontWeight: '800', color: C.ink },
  statLabel: { fontSize: 11, color: C.inkMuted, fontWeight: '600' },

  menuSection: { marginHorizontal: 20, marginBottom: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  menuCard: {
    backgroundColor: C.surface, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    ...shadow('sm'),
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 20 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 2 },
  menuSub: { fontSize: 12, color: C.inkMuted },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: C.error, borderRadius: 10,
    minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  arrow: { fontSize: 20, color: C.inkLight },
  menuDivider: { height: 1, backgroundColor: C.borderLight, marginLeft: 72 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.surface, borderRadius: 16,
    paddingVertical: 16, borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 15, fontWeight: '700', color: C.error },

  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 12, color: C.inkMuted, fontWeight: '600', marginBottom: 3 },
  footerSub: { fontSize: 11, color: C.inkLight },

  // guest
  guest: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  guestIconBox: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: C.blueLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: C.blueMid,
  },
  guestIcon: { fontSize: 52 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 10 },
  guestSub: { fontSize: 14, color: C.inkSub, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  primaryBtn: {
    width: '100%', height: 52, backgroundColor: C.blue,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    ...shadow('blue'),
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: {
    width: '100%', height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.blue, justifyContent: 'center', alignItems: 'center',
  },
  outlineBtnText: { color: C.blue, fontSize: 16, fontWeight: '700' },
});
