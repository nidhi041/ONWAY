import { Platform } from 'react-native';

/**
 * Returns cross-platform shadow styles.
 * On web, uses boxShadow. On native, uses shadow* props + elevation.
 */
export function shadow(
  offsetX: number,
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number = 2
): object {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}
