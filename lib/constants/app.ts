/**
 * Application constants
 * General app configuration and mode constants
 */

export const PHYSICIAN_MODE = 'Physician Mode' as const;
export const ADVERTISER_MODE = 'Advertise Mode' as const;

/**
 * Advertisers/Companies data
 */
export interface Advertiser {
  id: number;
  name: string;
}

export const ADVERTISERS: Advertiser[] = [
  {
    id: 1,
    name: 'Pfizer',
  },
  {
    id: 2,
    name: 'Genentech',
  },
  {
    id: 3,
    name: 'GSK',
  },
  {
    id: 4,
    name: 'Eli Lilly',
  },
];

/**
 * Supabase table names
 */
export const SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES = 'advertising_categories' as const;
export const SUPABASE_TABLE_NAME_CAMPAIGNS = 'campaigns' as const;
export const SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES = 'campaign_categories' as const;
export const SUPABASE_TABLE_NAME_CLICKS = 'clicks' as const;
export const SUPABASE_TABLE_NAME_COMPANIES = 'companies' as const;
export const SUPABASE_TABLE_NAME_IMPRESSIONS = 'impressions' as const;

/**
 * UI constants
 */
export const ROW_HEIGHT = 53;
