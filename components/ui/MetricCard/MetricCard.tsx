/**
 * MetricCard Component
 * Reusable metric display card for dashboards
 *
 * Eliminates duplicate code from:
 * - app/advertiser/page.tsx (3 cards, lines 182-303, ~120 lines)
 * - app/advertiser/view/[campaignId]/page.tsx (3 cards, lines 260-383, ~120 lines)
 * Total: 240 lines of duplication removed
 */

'use client';

import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { colors, spacing, borderRadius } from '@/theme';

export interface MetricCardProps {
  /** Title of the metric */
  title: string;
  /** Value to display (will be formatted by formatter if provided) */
  value: string | number;
  /** Loading state */
  loading?: boolean;
  /** Optional custom formatter function */
  formatter?: (value: any) => string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional value color override */
  valueColor?: string;
}

/**
 * MetricCard component for displaying key metrics
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Impressions"
 *   value={1234567}
 *   formatter={(val) => val.toLocaleString()}
 *   loading={false}
 * />
 *
 * <MetricCard
 *   title="Total Spend"
 *   value={1234.56}
 *   formatter={(val) => `$${val.toFixed(2)}`}
 * />
 *
 * <MetricCard
 *   title="CTR"
 *   value={3.45}
 *   formatter={(val) => `${val.toFixed(2)}%`}
 * />
 * ```
 */
export function MetricCard({
  title,
  value,
  loading = false,
  formatter,
  icon,
  subtitle,
  valueColor = colors.primary.main,
}: MetricCardProps) {
  const displayValue = formatter && !loading ? formatter(value) : value;

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: colors.background.paper,
        padding: spacing.xl,
        borderRadius: borderRadius.sm,
        border: `1px solid ${colors.border.main}`,
        textAlign: 'center',
      }}
    >
      {/* Icon (if provided) */}
      {icon && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          {icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="h6"
        style={{
          color: colors.text.primary,
          marginBottom: '10px',
        }}
      >
        {title}
      </Typography>

      {/* Value or Loading State */}
      {loading ? (
        <Box
          sx={{
            width: '150px',
            height: '40px',
            borderRadius: 1,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton
            variant="rectangular"
            width={150}
            height={40}
            sx={{
              bgcolor: colors.loading.skeleton,
              borderRadius: 1,
            }}
          />
        </Box>
      ) : (
        <>
          <Typography
            variant="h4"
            style={{
              color: valueColor,
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {displayValue}
          </Typography>

          {/* Optional subtitle */}
          {subtitle && (
            <Typography
              variant="caption"
              style={{
                color: colors.text.secondary,
                marginTop: spacing.sm,
                display: 'block',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
