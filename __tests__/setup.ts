// ─── Global Test Setup ──────────────────────────────────────────────────────────
// Mocks native modules that Jest/jest-expo cannot handle automatically.

// ─── Expo Router Mock ───────────────────────────────────────────────────────────

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  router: mockRouter,
  Link: 'Link',
}));

// ─── Expo Image Mock ────────────────────────────────────────────────────────────

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// ─── Expo Location Mock ─────────────────────────────────────────────────────────

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 19.076, longitude: 72.8777 },
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([
    { postalCode: '400001', street: 'MG Road', city: 'Mumbai', subregion: 'Mumbai Suburban' },
  ]),
}));

// ─── Expo Splash Screen Mock ────────────────────────────────────────────────────

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// ─── Expo Vector Icons Mock ─────────────────────────────────────────────────────

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// ─── React Native Safe Area Context Mock ────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ─── AsyncStorage Mock ──────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// ─── Firebase Config Mock ───────────────────────────────────────────────────────

jest.mock('@/config/firebase', () => ({
  db: {},
  auth: {},
  default: {},
}));

// ─── React 19 Testing Library Compat Mock ───────────────────────────────────────
// @testing-library/react-native@14 uses createRoot which was removed/changed in React 19
jest.mock('react-test-renderer', () => {
  const original = jest.requireActual('react-test-renderer') as any;
  return {
    ...original,
    createRoot: original.create,
  };
});

// Export mock router for tests that need direct access
module.exports = { mockRouter };
