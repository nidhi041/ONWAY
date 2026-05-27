import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.blue,
        tabBarInactiveTintColor: C.inkMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 }
            : { elevation: 8 }),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={22} name="cart.fill" color={color} />
              {cartCount > 0 && (
                <View style={st.badge}>
                  <Text style={st.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="category" options={{ href: null }} />
    </Tabs>
  );
}

const st = StyleSheet.create({
  badge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: C.error, borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3, borderWidth: 2, borderColor: C.surface,
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});
