import { Platform } from 'react-native';

export const Fonts = {
  regular: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }),
  medium: Platform.select({
    ios: 'SF Pro Text',
    android: 'sans-serif-medium',
    default: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }),
  semibold: Platform.select({
    ios: 'SF Pro Text',
    android: 'sans-serif-medium',
    default: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }),
  bold: Platform.select({
    ios: 'SF Pro Display',
    android: 'sans-serif-bold',
    default: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
  })
};
