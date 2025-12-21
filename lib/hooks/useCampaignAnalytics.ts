/**
 * useCampaignAnalytics Hook
 * Fetches and manages campaign analytics data
 * Extracts data fetching logic from StatsLineChart component
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { ChartDataPoint, CampaignStats, CategoryStats } from '@/lib/types';
import { formatDateForChart } from '@/lib/utils/dateUtils';

export interface UseCampaignAnalyticsOptions {
  /** Advertiser ID or Campaign ID depending on campaignSpecific flag */
  advertiserId: number;
  /** If true, fetches stats for a specific campaign. If false, fetches for all advertiser campaigns */
  campaignSpecific?: boolean;
  /** Start date for filtering (ISO string or null for no filter) */
  startDate?: string | null;
  /** End date for filtering (ISO string or null for no filter) */
  endDate?: string | null;
  /** If false, prevents automatic fetching on mount/param changes */
  enabled?: boolean;
  /** Additional filter - selected time filter string for date formatting */
  selectedFilter?: string;
}

export interface UseCampaignAnalyticsReturn {
  /** Time-series data for line charts */
  chartData: ChartDataPoint[];
  /** Campaign-level aggregated stats */
  campaignData: CampaignStats[];
  /** Category-level aggregated stats */
  categoryData: CategoryStats[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching campaign analytics data
 *
 * @param options - Configuration options
 * @returns Analytics data and control functions
 */
export function useCampaignAnalytics(
  options: UseCampaignAnalyticsOptions
): UseCampaignAnalyticsReturn {
  const {
    advertiserId,
    campaignSpecific = false,
    startDate = null,
    endDate = null,
    enabled = true,
    selectedFilter = 'Last 7 Days',
  } = options;

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!advertiserId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Determine API endpoint based on campaignSpecific flag
      const apiUrl = campaignSpecific
        ? `/api/advertisers/campaigns/${advertiserId}/stats`
        : `/api/advertisers/${advertiserId}/stats`;

      // Fetch data
      const response = await axios.get(
        `${apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );

      const statsData = response.data.stats || {};
      const timeSeriesData = statsData.timeSeriesData || [];
      const campaignStats = statsData.campaignStats || [];
      const categoryStats = statsData.categoryStats || [];

      // Transform time-series data for charts
      const transformedData: ChartDataPoint[] = timeSeriesData.map((stat: any) => {
        // Use more detailed date format for longer time ranges
        const includeYear = selectedFilter === 'Last 1 Year' || selectedFilter === 'All Time';
        const date = new Date(stat.date);
        const formattedDate = includeYear
          ? date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit',
            })
          : formatDateForChart(stat.date);

        return {
          date: formattedDate,
          impressions: stat.impressions || 0,
          clicks: stat.clicks || 0,
          spend: stat.spend || 0,
        };
      });

      setChartData(transformedData);
      setCampaignData(campaignStats);
      setCategoryData(categoryStats);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
      // Clear data on error
      setChartData([]);
      setCampaignData([]);
      setCategoryData([]);
    } finally {
      setLoading(false);
    }
  }, [advertiserId, campaignSpecific, startDate, endDate, selectedFilter]);

  // Auto-fetch when dependencies change (if enabled)
  useEffect(() => {
    if (enabled && advertiserId) {
      fetchData();
    }
  }, [enabled, fetchData, advertiserId]);

  return {
    chartData,
    campaignData,
    categoryData,
    loading,
    error,
    refetch: fetchData,
  };
}
