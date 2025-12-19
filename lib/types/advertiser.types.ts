/**
 * Advertiser-related type definitions
 */

/**
 * Core Advertiser interface
 * Represents a company that creates and manages advertising campaigns
 */
export interface Advertiser {
  id: number;
  name: string;
  created_at?: string;
}

/**
 * Advertiser with additional metadata
 */
export interface AdvertiserWithMeta extends Advertiser {
  campaign_count?: number;
  total_spend?: number;
  total_impressions?: number;
  total_clicks?: number;
}
