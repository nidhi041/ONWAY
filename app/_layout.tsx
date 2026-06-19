import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { LocationProvider } from '@/context/LocationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="saved-addresses" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
        <Stack.Screen name="help-support" options={{ headerShown: false }} />
        <Stack.Screen name="ordertracking" options={{ headerShown: false }} />
        <Stack.Screen name="payment-gateway" options={{ headerShown: false }} />
        <Stack.Screen name="saved-products" options={{ headerShown: false }} />
        <Stack.Screen name="order-confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="labtests" options={{ headerShown: false }} />
        <Stack.Screen name="labtests-address" options={{ headerShown: false }} />
        <Stack.Screen name="lab-bookings" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" backgroundColor="#ffffff00" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <OrdersProvider>
              <InnerLayout />
            </OrdersProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
