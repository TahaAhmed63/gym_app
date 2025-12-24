import { StyleSheet } from 'react-native';

// Modern gym theme: deep black background with neon purple + electric accent colors
export const COLORS = {
  // Primary (neon purple)
  primary: '#9B5CFF',
  primaryLight: 'rgba(155,92,255,0.12)',

  // Secondary (deep indigo for panels/accents)
  secondary: '#4B2B8D',
  secondaryLight: 'rgba(75,43,141,0.08)',

  // Accent (electric pink / glow)
  accent: '#FF5CAD',
  accentLight: 'rgba(255,92,173,0.10)',

  // Status Colors (high contrast on dark bg)
  success: '#00E676',
  successLight: 'rgba(0,230,118,0.12)',
  warning: '#FFB020',
  warningLight: 'rgba(255,176,32,0.12)',
  error: '#FF5252',
  errorLight: 'rgba(255,82,82,0.12)',
  info: '#4FD1FF',
  infoLight: 'rgba(79,209,255,0.10)',

  // Neutrals for dark theme
  black: '#000000', // base black
  darkGray: '#A1A1AA', // subdued text
  gray: '#8E8EA3',
  lightGray: '#2A2A33',
  background: '#07060A', // very dark background with slight warmth
  white: '#FFFFFF',
  // Surface colors for cards / panels (prefer these over bright white in a dark theme)
  surface: '#0E0D12',
  surfaceLight: '#14131A',
};

export const SIZES = {
  // Font Sizes
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 16,
  body2: 15,
  body3: 14,
  body4: 13,
  caption: 12,

  // Screen Padding
  padding: 16,

  // Border Radius
  radius: 12,

  // Shadow (neon glow)
  shadow: {
    shadowColor: 'rgba(155,92,255,0.22)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontFamily: 'Inter-SemiBold',
  },
  h2: {
    fontSize: SIZES.h2,
    fontFamily: 'Inter-SemiBold',
  },
  h3: {
    fontSize: SIZES.h3,
    fontFamily: 'Inter-Medium',
  },
  h4: {
    fontSize: SIZES.h4,
    fontFamily: 'Inter-Medium',
  },
  body1: {
    fontSize: SIZES.body1,
    fontFamily: 'Inter-Regular',
  },
  body2: {
    fontSize: SIZES.body2,
    fontFamily: 'Inter-Regular',
  },
  body3: {
    fontSize: SIZES.body3,
    fontFamily: 'Inter-Regular',
  },
  body4: {
    fontSize: SIZES.body4,
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: SIZES.caption,
    fontFamily: 'Inter-Regular',
  },
};