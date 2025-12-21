/**
 * Main theme configuration and exports
 * Creates complete MUI theme with custom colors, spacing, and component overrides
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors } from './colors';
import { borderRadius } from './spacing';
import { typography } from './typography';

// Create the MUI theme with our custom configuration
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    error: {
      main: colors.status.error.main,
    },
    warning: {
      main: colors.status.warning.main,
    },
    info: {
      main: colors.status.info.main,
    },
    success: {
      main: colors.status.success.main,
    },
    divider: colors.border.main,
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    fontSize: 14,
    fontWeightLight: typography.fontWeight.light,
    fontWeightRegular: typography.fontWeight.regular,
    fontWeightMedium: typography.fontWeight.medium,
    fontWeightBold: typography.fontWeight.bold,
  },
  spacing: 4, // Base spacing unit (4px)
  shape: {
    borderRadius: 8, // Default border radius in px
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius.sm,
        },
        contained: {
          backgroundColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.background.input,
            '& fieldset': {
              borderColor: colors.border.main,
            },
            '&:hover fieldset': {
              borderColor: colors.border.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove MUI's default gradient
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.border.main,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border.main,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.elevated,
          color: colors.text.primary,
        },
      },
    },
  },
};

// Create and export the theme
export const theme = createTheme(themeOptions);

// Re-export all theme utilities for convenient imports
export { colors } from './colors';
export { spacing, borderRadius, heights, widths, zIndex } from './spacing';
export { typography } from './typography';
export { componentStyles, createLoadingBoxStyle, mergeStyles } from './components';

// Type exports
export type { ColorKey } from './colors';
export type {
  SpacingKey,
  BorderRadiusKey,
  HeightKey,
  WidthKey,
  ZIndexKey,
} from './spacing';
export type {
  FontFamilyKey,
  FontSizeKey,
  FontWeightKey,
  LineHeightKey,
  LetterSpacingKey,
} from './typography';
