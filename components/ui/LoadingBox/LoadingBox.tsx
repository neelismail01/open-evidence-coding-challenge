/**
 * LoadingBox Component
 * Reusable loading skeleton component
 *
 * Eliminates duplicate loadingBoxStyle from:
 * - app/advertiser/page.tsx (lines 23-28)
 * - app/advertiser/edit/[campaignId]/page.tsx (lines 128-133, 286-291, 411-416)
 * Total: 13+ occurrences across multiple files
 */

'use client';

import React from 'react';
import { Skeleton, SxProps, Theme } from '@mui/material';
import { colors } from '@/theme';

export interface LoadingBoxProps {
  /** Width of the loading box (default: '100%') */
  width?: string | number;
  /** Height of the loading box (default: 20) */
  height?: string | number;
  /** Skeleton variant (default: 'rounded') */
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  /** Additional sx props */
  sx?: SxProps<Theme>;
}

/**
 * LoadingBox component for consistent loading states
 *
 * @example
 * ```tsx
 * // Default usage
 * <LoadingBox />
 *
 * // Custom height
 * <LoadingBox height={42} />
 *
 * // Custom width and height
 * <LoadingBox width="150px" height={40} />
 *
 * // Circular variant
 * <LoadingBox variant="circular" width={48} height={48} />
 * ```
 */
export function LoadingBox({
  width = '100%',
  height = 20,
  variant = 'rounded',
  sx,
}: LoadingBoxProps) {
  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      sx={{
        bgcolor: colors.loading.skeleton,
        borderRadius: 1,
        ...sx,
      }}
    />
  );
}
