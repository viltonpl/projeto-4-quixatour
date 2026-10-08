import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#231917',
    background: '#fff8f6',
    backgroundElement: '#fdeae5',
    backgroundSelected: '#fed0bc',
    textSecondary: '#795747',
  },
  dark: {
    text: '#ffffff',
    background: '#231917',
    backgroundElement: '#351000',
    backgroundSelected: '#723615',
    textSecondary: '#ddc0b6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const QuixaColors = {
  background: '#fff8f6',
  surface: '#fff8f6',
  surfaceContainer: '#fdeae5',
  surfaceContainerLow: '#fff1ed',
  surfaceContainerHigh: '#f7e4df',
  primary: '#9c3f10',
  primaryContainer: '#bc5627',
  onPrimary: '#ffffff',
  secondary: '#795747',
  secondaryContainer: '#fed0bc',
  onSecondaryContainer: '#795747',
  onSurface: '#231917',
  onSurfaceVariant: '#56423b',
  outline: '#8a7269',
  outlineVariant: '#ddc0b6',
  tertiary: '#8c4a28',
  primaryFixedDim: '#ffb598',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
