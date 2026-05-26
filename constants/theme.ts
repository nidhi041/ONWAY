/**
 * ONWAY — Premium Healthcare Design System
 * Primary: #2563EB  |  Teal: #14B8A6  |  BG: #F8FAFC
 */
import { Dimensions, Platform } from 'react-native';

const { width: W } = Dimensions.get('window');

// ─── Core Palette ─────────────────────────────────────────────────────────────
export const C = {
  // Brand
  blue:        '#2563EB',
  blueLight:   '#EFF6FF',
  blueMid:     '#DBEAFE',
  teal:        '#14B8A6',
  tealLight:   '#F0FDFA',

  // Semantic
  success:     '#22C55E',
  successBg:   '#F0FDF4',
  error:       '#EF4444',
  errorBg:     '#FEF2F2',
  warning:     '#F59E0B',
  warningBg:   '#FFFBEB',

  // Neutrals
  bg:          '#F8FAFC',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F1F5F9',
  border:      '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  ink:         '#0F172A',
  inkSub:      '#475569',
  inkMuted:    '#94A3B8',
  inkLight:    '#CBD5E1',

  // Dark
  dark:        '#0F172A',
  darkCard:    '#1E293B',
};

// Gradient stops (used as fallback solid or in LinearGradient)
export const GRAD = { start: '#2563EB', end: '#14B8A6' };

// Shadows
export const shadow = (level: 'sm' | 'md' | 'lg' | 'blue') => {
  const map = {
    sm:   Platform.OS === 'ios' ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : { elevation: 2 },
    md:   Platform.OS === 'ios' ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,  shadowRadius: 12, elevation: 4 } : { elevation: 4 },
    lg:   Platform.OS === 'ios' ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 8 } : { elevation: 8 },
    blue: Platform.OS === 'ios' ? { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,  shadowRadius: 12, elevation: 6 } : { elevation: 6 },
  };
  return map[level];
};

export const Screen = { width: W, cardW: (W - 40 - 12) / 2 };

// Legacy compat
export const Palette = {
  primary: C.blue, primaryLight: C.blueLight,
  accent: C.teal,
  success: C.success, successLight: C.successBg,
  danger: C.error, dangerLight: C.errorBg,
  ink: C.ink, inkSecondary: C.inkSub, inkMuted: C.inkMuted,
  navy: C.dark, bg: C.bg, border: C.border,
  white: C.surface,
};

// Colors scheme for theme configuration and component style fallbacks
export const Colors = {
  light: {
    text: C.ink,
    background: C.bg,
    tint: C.blue,
    icon: C.inkMuted,
    tabIconDefault: C.inkMuted,
    tabIconSelected: C.blue,
  },
  dark: {
    text: '#ECEDEE',
    background: C.dark,
    tint: '#ffffff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#ffffff',
  },
};

// Font family mappings across platforms
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

