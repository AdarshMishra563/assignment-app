import { Platform } from 'react-native';
import { Fonts } from './fonts';

export const Typography = {
  fontFamily: Fonts.regular,
  fontFamilyMedium: Fonts.medium,
  fontFamilySemibold: Fonts.semibold,
  fontFamilyBold: Fonts.bold,
  fontFamilyMono: Fonts.mono,

  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const
  },

  // Line Heights
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    heading: 32,
    display: 42
  },

  // Crisp Letter Spacing
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.5,
    caps: 1.2
  }
};
