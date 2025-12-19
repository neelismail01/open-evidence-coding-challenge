/**
 * Centralized spacing and sizing constants
 * Based on 4px grid system for consistent spacing throughout the application
 */

export const spacing = {
  // Base spacing units (4px grid)
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '25px',
  full: '30px',
  circle: '50%',
} as const;

export const heights = {
  // Common component heights
  button: '42px',
  input: '40px',
  inputSmall: '32px',
  header: '64px',
  row: '48px',
  skeleton: '20px',
  skeletonLarge: '40px',
} as const;

export const widths = {
  // Common component widths
  sidebar: '280px',
  sidebarCollapsed: '64px',
  containerMaxWidth: '1200px',
} as const;

export const zIndex = {
  // Z-index layering system
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  overlay: 1200,
} as const;

// Type exports for TypeScript
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type HeightKey = keyof typeof heights;
export type WidthKey = keyof typeof widths;
export type ZIndexKey = keyof typeof zIndex;
