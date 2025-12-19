/**
 * Campaign-related type definitions
 * Centralized types to eliminate duplication across components
 */

/**
 * Core Campaign interface
 * Used across advertiser pages, context, and API responses
 */
export interface Campaign {
  id: number;
  created_at: string;
  treatment_name: string;
  description: string;
  company_id?: number;
  active: boolean;
  product_url?: string;

  // Optional analytics fields (present when campaigns are fetched with stats)
  impressions_count?: number;
  clicks_count?: number;
  total_cost?: number;
  cost_per_click?: number;

  // Optional nested relations
  companies?: Company;
}

/**
 * Company/Advertiser company information
 */
export interface Company {
  id: number;
  created_at: string;
  name: string;
}

/**
 * Campaign Category association
 * Represents a category that a campaign targets with a specific bid
 */
export interface CampaignCategory {
  id: number;
  campaign_id: number;
  advertising_category_id: number;
  active: boolean;
  bid: number;

  // Optional nested advertising category details
  advertising_categories?: {
    id: number;
    category_string: string;
  };

  // Optional analytics fields (present when fetched with stats)
  matches?: number;
  impressions?: number;
  clicks?: number;
  spend?: number;
  ctr?: number;
}

/**
 * Advertising Category master data
 */
export interface AdvertisingCategory {
  id: number;
  category_string: string;
  created_at?: string;
}

/**
 * Campaign with nested company information
 */
export interface CampaignWithCompany extends Campaign {
  companies: Company;
}

/**
 * Campaign with analytics metrics
 */
export interface CampaignWithStats extends Campaign {
  impressions_count: number;
  clicks_count: number;
  total_cost: number;
  cost_per_click: number;
}

/**
 * Campaign update payload (partial update)
 */
export type CampaignUpdate = Partial<Pick<Campaign,
  | 'treatment_name'
  | 'description'
  | 'active'
  | 'product_url'
>>;

/**
 * Campaign status for filtering/display
 */
export type CampaignStatus = 'active' | 'inactive' | 'all';
