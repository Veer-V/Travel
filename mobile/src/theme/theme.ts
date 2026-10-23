import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const colors = {
  primary: '#0F766E', // Emerald / Deep Teal
  primaryLight: '#14B8A6',
  primaryDark: '#0D5F58',
  secondary: '#F97316', // Sunset Coral
  secondaryLight: '#FB923C',
  accent: '#F59E0B', // Golden Amber
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textMuted: '#64748B', // Slate 500
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  
  // Risk colors
  riskLow: '#10B981',
  riskModerate: '#F59E0B',
  riskElevated: '#F97316',
  riskHigh: '#EF4444',
  riskWarning: '#DC2626',
  riskInsufficient: '#64748B'
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#F8FAFC',
    }
  }
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    background: '#0B1120',
    surface: '#0F172A',
    surfaceVariant: '#1E293B',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#0F172A',
      level2: '#1E293B',
    }
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999
};
