/**
 * Reusable MUI component style objects
 * These styles are currently duplicated across multiple files and should be imported from here
 */

import { SxProps, Theme } from '@mui/material';
import { colors } from './colors';
import { spacing, borderRadius, heights } from './spacing';

export const componentStyles = {
  // Loading skeleton box
  loadingBox: {
    width: '100%',
    height: heights.skeleton,
    bgcolor: colors.loading.skeleton,
    borderRadius: 1,
  } as SxProps<Theme>,

  // TextField styling - consistent across all text inputs
  textField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: colors.border.main,
      },
      '&:hover fieldset': {
        borderColor: colors.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.text.tertiary,
      fontSize: '14px',
      '&.Mui-focused': {
        color: colors.primary.main,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: colors.text.primary,
      fontSize: '14px',
      height: '10px',
      // Style the numeric input arrows to be white
      '&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button': {
        WebkitAppearance: 'auto',
        opacity: 1,
        filter: 'invert(1)',
      },
    },
  } as SxProps<Theme>,

  // Menu item styling
  menuItem: {
    backgroundColor: colors.background.paper,
    color: colors.text.primary,
    '&:hover': {
      backgroundColor: colors.background.elevated,
    },
    '&.Mui-selected': {
      backgroundColor: colors.primary.main,
      '&:hover': {
        backgroundColor: colors.primary.dark,
      },
    },
  } as SxProps<Theme>,

  // Form field container
  formField: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.main}`,
    padding: '15px',
    marginBottom: spacing.lg,
  } as SxProps<Theme>,

  // Save button styling
  saveButton: {
    backgroundColor: colors.primary.main,
    color: colors.text.primary,
    '&:hover': {
      backgroundColor: colors.primary.dark,
    },
    '&:disabled': {
      backgroundColor: colors.background.elevated,
      color: colors.text.disabled,
    },
    textTransform: 'none' as const,
    fontWeight: 600,
    height: heights.button,
  } as SxProps<Theme>,

  // Card styling
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    border: `1px solid ${colors.border.main}`,
  } as SxProps<Theme>,

  // Table row styling
  tableRow: {
    '&:hover': {
      backgroundColor: colors.background.elevated,
    },
    cursor: 'pointer',
  } as SxProps<Theme>,

  // Status badge base
  statusBadge: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  } as SxProps<Theme>,

  // Active status badge
  statusBadgeActive: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
    backgroundColor: colors.status.success.bg,
    color: colors.status.success.main,
  } as SxProps<Theme>,

  // Inactive status badge
  statusBadgeInactive: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
    backgroundColor: colors.status.error.bg,
    color: colors.status.error.main,
  } as SxProps<Theme>,

  // Select dropdown styling
  select: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    color: colors.text.primary,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border.main,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.border.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
  } as SxProps<Theme>,

  // Dialog/Modal overlay
  dialogOverlay: {
    backgroundColor: colors.overlay.modal,
  } as SxProps<Theme>,

  // Scrollbar styling (for webkit browsers)
  scrollbar: {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: colors.background.default,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: colors.border.light,
      borderRadius: borderRadius.sm,
      '&:hover': {
        backgroundColor: colors.text.muted,
      },
    },
  } as SxProps<Theme>,

  // Icon button
  iconButton: {
    color: colors.text.primary,
    '&:hover': {
      backgroundColor: colors.alpha.white10,
    },
  } as SxProps<Theme>,

  // Chip/Tag styling
  chip: {
    backgroundColor: colors.background.elevated,
    color: colors.text.primary,
    border: `1px solid ${colors.border.main}`,
    '&:hover': {
      backgroundColor: colors.background.paper,
    },
  } as SxProps<Theme>,

  // Link styling
  link: {
    color: colors.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primary.light,
    },
  } as SxProps<Theme>,

  // Container with max width
  container: {
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  } as SxProps<Theme>,

  // Paper with elevation
  paper: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
  } as SxProps<Theme>,

  // Divider
  divider: {
    borderColor: colors.border.main,
  } as SxProps<Theme>,
} as const;

// Helper function to create a custom loading box style with different dimensions
export function createLoadingBoxStyle(height: number | string = 20, width: string | number = '100%'): SxProps<Theme> {
  return {
    width,
    height,
    bgcolor: colors.loading.skeleton,
    borderRadius: 1,
  };
}

// Helper function to merge component styles
export function mergeStyles(...styles: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  const filteredStyles = styles.filter((s): s is SxProps<Theme> => s !== undefined);

  if (filteredStyles.length === 0) {
    return {};
  }

  if (filteredStyles.length === 1) {
    return filteredStyles[0];
  }

  // If any style is an array, concatenate all styles as an array
  if (filteredStyles.some(s => Array.isArray(s))) {
    return filteredStyles.flatMap(s => Array.isArray(s) ? s : [s]);
  }

  // Otherwise merge all object styles
  return Object.assign({}, ...filteredStyles);
}
