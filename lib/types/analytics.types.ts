/**
 * Analytics and metrics type definitions
 * Used for charts, reports, and dashboard metrics
 */

/**
 * Time-series data point for charts
 * Represents metrics for a specific date
 */
export interface ChartDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr?: number;
}

/**
 * Campaign-level analytics
 * Aggregated metrics for a single campaign
 */
export interface CampaignStats {
  id: number;
  name: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr?: number;
  cost_per_click?: number;
}

/**
 * Category-level analytics
 * Aggregated metrics for a specific advertising category
 */
export interface CategoryStats {
  id: number;
  category: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr?: number;
  cost_per_click?: number;
  matches?: number;
}

/**
 * Metric card data for dashboard display
 * Generic interface for displaying metric cards
 */
export interface MetricCardData {
  title: string;
  value: string | number;
  loading?: boolean;
  formatter?: (value: any) => string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Time filter options for analytics queries
 */
export const TIME_FILTER_OPTIONS = [
  'Last 24 Hours',
  'Last 7 Days',
  'Last 30 Days',
  'Last 1 Year',
  'All Time',
] as const;

export type TimeFilterOption = typeof TIME_FILTER_OPTIONS[number];

/**
 * Date range for analytics queries
 */
export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

/**
 * Aggregate statistics across all campaigns
 */
export interface AggregateStats {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  aggregateCTR: number;
  averageCPC?: number;
  activeCampaigns?: number;
}

/**
 * Impression event data
 */
export interface ImpressionEvent {
  id: number;
  ad_id: number;
  created_at: string;
  user_id?: string;
  category_match?: string;
}

/**
 * Click event data
 */
export interface ClickEvent {
  id: number;
  ad_id: number;
  impression_id?: number;
  created_at: string;
  user_id?: string;
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  startDate?: string | null;
  endDate?: string | null;
  campaignId?: number;
  advertiserId?: number;
  categoryId?: number;
}

/**
 * Chart configuration types
 */
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
export type MetricType = 'impressions' | 'clicks' | 'spend' | 'ctr' | 'cost_per_click';

/**
 * Chart data configuration
 */
export interface ChartConfig {
  type: ChartType;
  metric: MetricType;
  title: string;
  color?: string;
  data: ChartDataPoint[] | CampaignStats[] | CategoryStats[];
}
