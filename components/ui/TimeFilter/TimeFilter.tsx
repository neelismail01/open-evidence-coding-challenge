/**
 * TimeFilter Component
 * Reusable time range filter selector
 *
 * Eliminates duplicate code from:
 * - app/advertiser/page.tsx (lines 331-422, 90 lines)
 * - app/advertiser/view/[campaignId]/page.tsx (lines 515-605, 90 lines)
 * Total: 180 lines of duplication removed
 */

'use client';

import React from 'react';
import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { TIME_FILTER_OPTIONS } from '@/lib/constants';
import type { TimeFilterOption } from '@/lib/types';
import { colors, spacing, borderRadius } from '@/theme';

export interface TimeFilterProps {
  /** Currently selected time filter */
  value: TimeFilterOption;
  /** Callback when filter changes */
  onChange: (filter: TimeFilterOption) => void;
  /** Optional title to display above the filter */
  title?: string;
  /** Disable the filter */
  disabled?: boolean;
}

/**
 * TimeFilter component for selecting analytics time ranges
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<TimeFilterOption>('Last 7 Days');
 *
 * <TimeFilter
 *   value={filter}
 *   onChange={setFilter}
 *   title="Campaign Performance"
 * />
 * ```
 */
export function TimeFilter({
  value,
  onChange,
  title = 'Performance',
  disabled = false,
}: TimeFilterProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as TimeFilterOption);
  };

  const menuItemStyle = {
    backgroundColor: colors.background.paper,
    color: colors.text.primary,
    fontSize: '14px',
    padding: '12px 16px',
    '&:hover': {
      backgroundColor: colors.background.elevated,
    },
    '&.Mui-selected': {
      backgroundColor: colors.primary.main,
      '&:hover': {
        backgroundColor: colors.primary.main,
      },
    },
  };

  return (
    <Box
      sx={{
        margin: '0 auto 20px auto',
        backgroundColor: colors.background.paper,
        padding: '16px 20px',
        borderRadius: borderRadius.sm,
        border: `1px solid ${colors.border.main}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.lg,
      }}
    >
      <Typography
        style={{
          color: colors.text.primary,
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: 'fit-content',
        }}
      >
        {title}
      </Typography>
      <FormControl sx={{ minWidth: 200 }}>
        <Select
          labelId="filter-select-label"
          id="filter-select"
          value={value}
          disabled={disabled}
          sx={{
            color: colors.text.primary,
            fontSize: '14px',
            height: '42px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.border.main,
              borderWidth: '1px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
            '.MuiSvgIcon-root': {
              fill: `${colors.text.primary} !important`,
              fontSize: '20px',
            },
            '& .MuiSelect-select': {
              paddingTop: '12px',
              paddingBottom: '12px',
            },
          }}
          onChange={handleChange}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: colors.background.paper,
                border: `1px solid ${colors.border.main}`,
                borderRadius: borderRadius.sm,
                marginTop: '4px',
              },
            },
          }}
        >
          {TIME_FILTER_OPTIONS.map((option) => (
            <MenuItem key={option} value={option} sx={menuItemStyle}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
