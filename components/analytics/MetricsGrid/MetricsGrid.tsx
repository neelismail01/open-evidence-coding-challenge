/**
 * MetricsGrid Component
 * Layout wrapper for metric cards
 */

'use client';

import React from 'react';
import { Box } from '@mui/material';
import { MetricCard, MetricCardProps } from '@/components/ui/MetricCard';

export interface MetricsGridProps {
  /** Array of metric card configurations */
  metrics: MetricCardProps[];
  /** Gap between cards (default: '20px') */
  gap?: string;
}

/**
 * MetricsGrid component for laying out multiple metric cards
 *
 * @example
 * ```tsx
 * const metrics = [
 *   {
 *     title: 'Total Impressions',
 *     value: totalImpressions,
 *     formatter: (val) => val.toLocaleString(),
 *     loading: isLoading,
 *   },
 *   {
 *     title: 'Total Spend',
 *     value: totalSpend,
 *     formatter: (val) => `$${val.toFixed(2)}`,
 *     loading: isLoading,
 *   },
 *   {
 *     title: 'Aggregate CTR',
 *     value: aggregateCTR,
 *     formatter: (val) => `${val.toFixed(2)}%`,
 *     loading: isLoading,
 *   },
 * ];
 *
 * <MetricsGrid metrics={metrics} />
 * ```
 */
export function MetricsGrid({ metrics, gap = '20px' }: MetricsGridProps) {
  return (
    <Box
      sx={{
        margin: '0 auto 20px auto',
        display: 'flex',
        gap,
      }}
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </Box>
  );
}
