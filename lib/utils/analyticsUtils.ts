/**
 * Analytics calculation utilities
 * Centralizes metric calculations for campaigns and ads
 */

import type { Campaign, CampaignStats, AggregateStats } from '@/lib/types';

/**
 * Calculates Click-Through Rate (CTR)
 * @param clicks - Number of clicks
 * @param impressions - Number of impressions
 * @returns CTR as a decimal (e.g., 0.05 for 5%)
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return clicks / impressions;
}

/**
 * Calculates Cost Per Click (CPC)
 * @param totalCost - Total cost/spend
 * @param clicks - Number of clicks
 * @returns Cost per click
 */
export function calculateCPC(totalCost: number, clicks: number): number {
  if (clicks === 0) return 0;
  return totalCost / clicks;
}

/**
 * Calculates Cost Per Impression (CPM - Cost Per Mille)
 * @param totalCost - Total cost/spend
 * @param impressions - Number of impressions
 * @returns Cost per 1000 impressions
 */
export function calculateCPM(totalCost: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (totalCost / impressions) * 1000;
}

/**
 * Calculates total spend across campaigns
 * @param campaigns - Array of campaigns
 * @returns Total spend amount
 */
export function calculateTotalSpend(campaigns: Array<{ total_cost?: number }>): number {
  return campaigns.reduce((sum, c) => sum + (c.total_cost || 0), 0);
}

/**
 * Calculates total impressions across campaigns
 * @param campaigns - Array of campaigns
 * @returns Total impressions count
 */
export function calculateTotalImpressions(campaigns: Array<{ impressions_count?: number }>): number {
  return campaigns.reduce((sum, c) => sum + (c.impressions_count || 0), 0);
}

/**
 * Calculates total clicks across campaigns
 * @param campaigns - Array of campaigns
 * @returns Total clicks count
 */
export function calculateTotalClicks(campaigns: Array<{ clicks_count?: number }>): number {
  return campaigns.reduce((sum, c) => sum + (c.clicks_count || 0), 0);
}

/**
 * Calculates aggregate statistics for a set of campaigns
 * @param campaigns - Array of campaigns with stats
 * @returns Aggregate statistics object
 */
export function calculateAggregateStats(campaigns: Campaign[]): AggregateStats {
  const totalSpend = calculateTotalSpend(campaigns);
  const totalImpressions = calculateTotalImpressions(campaigns);
  const totalClicks = calculateTotalClicks(campaigns);
  const aggregateCTR = calculateCTR(totalClicks, totalImpressions);
  const averageCPC = calculateCPC(totalSpend, totalClicks);
  const activeCampaigns = campaigns.filter(c => c.active).length;

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    aggregateCTR,
    averageCPC,
    activeCampaigns,
  };
}

/**
 * Sorts campaigns by a specific metric
 * @param campaigns - Array of campaigns
 * @param metric - Metric to sort by
 * @param order - Sort order (default: descending)
 * @returns Sorted array of campaigns
 */
export function sortCampaignsByMetric(
  campaigns: CampaignStats[],
  metric: 'impressions' | 'clicks' | 'spend' | 'ctr',
  order: 'asc' | 'desc' = 'desc'
): CampaignStats[] {
  const sorted = [...campaigns].sort((a, b) => {
    let aValue = 0;
    let bValue = 0;

    switch (metric) {
      case 'impressions':
        aValue = a.impressions;
        bValue = b.impressions;
        break;
      case 'clicks':
        aValue = a.clicks;
        bValue = b.clicks;
        break;
      case 'spend':
        aValue = a.spend;
        bValue = b.spend;
        break;
      case 'ctr':
        aValue = a.ctr || calculateCTR(a.clicks, a.impressions);
        bValue = b.ctr || calculateCTR(b.clicks, b.impressions);
        break;
    }

    return order === 'desc' ? bValue - aValue : aValue - bValue;
  });

  return sorted;
}

/**
 * Gets top N campaigns by a specific metric
 * @param campaigns - Array of campaigns
 * @param metric - Metric to sort by
 * @param count - Number of top campaigns to return (default: 10)
 * @returns Top N campaigns
 */
export function getTopCampaigns(
  campaigns: CampaignStats[],
  metric: 'impressions' | 'clicks' | 'spend' | 'ctr',
  count: number = 10
): CampaignStats[] {
  return sortCampaignsByMetric(campaigns, metric, 'desc').slice(0, count);
}

/**
 * Calculates conversion rate
 * @param conversions - Number of conversions
 * @param clicks - Number of clicks
 * @returns Conversion rate as a decimal
 */
export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks === 0) return 0;
  return conversions / clicks;
}

/**
 * Calculates Return on Ad Spend (ROAS)
 * @param revenue - Revenue generated
 * @param adSpend - Amount spent on ads
 * @returns ROAS ratio (e.g., 3.5 means $3.50 revenue per $1 spent)
 */
export function calculateROAS(revenue: number, adSpend: number): number {
  if (adSpend === 0) return 0;
  return revenue / adSpend;
}
