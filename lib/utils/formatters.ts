/**
 * Formatting utility functions
 * Centralizes number, currency, and percentage formatting
 */

/**
 * Formats a number as currency (USD)
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number as a percentage
 * @param value - The decimal value to format (e.g., 0.25 for 25%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "25.00%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a CTR (Click-Through Rate)
 * @param clicks - Number of clicks
 * @param impressions - Number of impressions
 * @returns Formatted CTR percentage string
 */
export function formatCTR(clicks: number, impressions: number): string {
  if (impressions === 0) return '0.00%';
  return formatPercentage(clicks / impressions);
}

/**
 * Formats a large number with abbreviations (K, M, B)
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatNumberShort(value: number, decimals: number = 1): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toString();
}

/**
 * Formats a number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats a number with decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Formats bytes to human-readable size
 * @param bytes - Number of bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a duration in milliseconds to a readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
