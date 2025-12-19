/**
 * Centralized color palette for the application
 * All color values used throughout the UI should reference these constants
 */

export const colors = {
  // Primary brand color - Orange
  primary: {
    main: '#d45b15',
    light: '#e67333',
    dark: '#b34711',
    hover: '#b34711', // Alias for consistency with existing code
  },

  // Background colors
  background: {
    default: '#121212',      // Main application background
    paper: '#1a1a1a',        // Card and paper surfaces
    elevated: '#2a2a2a',     // Elevated components (dialogs, popovers)
    input: '#2a2a2a',        // Form input backgrounds
  },

  // Border colors
  border: {
    main: '#333',
    light: '#444',
    dark: '#222',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: '#ccc',
    disabled: 'rgba(255, 255, 255, 0.5)',
    muted: '#666',
    subtle: '#888',
  },

  // Status colors
  status: {
    success: {
      main: '#67e077',
      bg: '#022907',
      light: '#4caf50',
    },
    error: {
      main: '#d6857a',
      bg: '#6b1206',
      light: '#f44336',
    },
    warning: {
      main: '#ff9800',
      bg: '#663c00',
    },
    info: {
      main: '#2196f3',
      bg: '#0d47a1',
    },
  },

  // Chart colors
  chart: {
    orange: '#d45b15',
    blue: '#00a8e8',
    green: '#00c853',
    purple: '#9c27b0',
    yellow: '#ffc107',
    red: '#f44336',
    teal: '#009688',
    pink: '#e91e63',
  },

  // Loading/Skeleton colors
  loading: {
    skeleton: '#525252',
    shimmer: 'rgba(255, 255, 255, 0.1)',
  },

  // Overlay colors
  overlay: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    modal: 'rgba(0, 0, 0, 0.8)',
  },

  // Transparent variations
  alpha: {
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
    black50: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

// Type for color keys (useful for TypeScript autocompletion)
export type ColorKey = keyof typeof colors;
