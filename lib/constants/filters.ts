/**
 * Time filter constants
 * Used for analytics date range filtering
 */

export const FILTER_DURATION_24_HRS = 'Last 24 Hours' as const;
export const FILTER_DURATION_7_DAYS = 'Last 7 Days' as const;
export const FILTER_DURATION_30_DAYS = 'Last 30 Days' as const;
export const FILTER_DURATION_1_YEAR = 'Last 1 Year' as const;
export const FILTER_DURATION_ALL_TIME = 'All Time' as const;

/**
 * Array of all available time filter options
 */
export const TIME_FILTER_OPTIONS = [
  FILTER_DURATION_24_HRS,
  FILTER_DURATION_7_DAYS,
  FILTER_DURATION_30_DAYS,
  FILTER_DURATION_1_YEAR,
  FILTER_DURATION_ALL_TIME,
] as const;

/**
 * Default filter for analytics queries
 */
export const DEFAULT_TIME_FILTER = FILTER_DURATION_7_DAYS;
