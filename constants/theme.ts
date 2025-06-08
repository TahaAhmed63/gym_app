import { StyleSheet } from 'react-native';

export const COLORS = {
  // Primary Colors
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  
  // Secondary Colors
  secondary: '#7C3AED',
  secondaryLight: '#EDE9FE',
  
  // Accent Colors
  accent: '#F97316',
  accentLight: '#FFEDD5',
  
  // Status Colors
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
  
  // Neutral Colors
  black: '#1E293B',
  darkGray: '#64748B',
  gray: '#94A3B8',
  lightGray: '#E2E8F0',
  background: '#F8FAFC',
  white: '#FFFFFF',
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
  
  // Shadow
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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