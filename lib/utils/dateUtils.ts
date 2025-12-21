/**
 * Date utility functions
 * Centralizes date filtering and formatting logic
 */

import type { TimeFilterOption, DateRange } from '@/lib/types';
import {
  FILTER_DURATION_24_HRS,
  FILTER_DURATION_7_DAYS,
  FILTER_DURATION_30_DAYS,
  FILTER_DURATION_1_YEAR,
  FILTER_DURATION_ALL_TIME,
} from '@/lib/constants';

/**
 * Converts a time filter string to start and end ISO date strings
 * @param filter - The time filter option
 * @returns Tuple of [startDate, endDate]. Both null means "All Time"
 */
export function getStartAndEndDatesFromFilter(
  filter: TimeFilterOption | string
): [string | null, string | null] {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = now; // End date is always now, unless filter is 'All Time'

  switch (filter) {
    case FILTER_DURATION_24_HRS:
      startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      break;
    case FILTER_DURATION_7_DAYS:
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      break;
    case FILTER_DURATION_30_DAYS:
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      break;
    case FILTER_DURATION_1_YEAR:
      startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      break;
    case FILTER_DURATION_ALL_TIME:
      return [null, null]; // No date filtering
    default:
      return [null, null]; // Default to all time if filter is unrecognized
  }

  return [
    startDate ? startDate.toISOString() : null,
    endDate ? endDate.toISOString() : null
  ];
}

/**
 * Converts a time filter to a DateRange object
 * @param filter - The time filter option
 * @returns DateRange object with startDate and endDate
 */
export function getDateRangeFromFilter(filter: TimeFilterOption | string): DateRange {
  const [startDate, endDate] = getStartAndEndDatesFromFilter(filter);
  return { startDate, endDate };
}

/**
 * Formats a date string for chart display
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15")
 */
export function formatDateForChart(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date string for full display
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 15, 2025")
 */
export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string with time
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets a relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Checks if a date is within a given range
 * @param date - Date to check
 * @param startDate - Range start date (null means no start)
 * @param endDate - Range end date (null means no end)
 * @returns True if date is within range
 */
export function isDateInRange(
  date: string | Date,
  startDate: string | Date | null,
  endDate: string | Date | null
): boolean {
  const checkDate = new Date(date).getTime();

  if (startDate !== null && checkDate < new Date(startDate).getTime()) {
    return false;
  }

  if (endDate !== null && checkDate > new Date(endDate).getTime()) {
    return false;
  }

  return true;
}
