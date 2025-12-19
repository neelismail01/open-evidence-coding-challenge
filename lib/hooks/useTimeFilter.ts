/**
 * useTimeFilter Hook
 * Manages time filter state and provides date ranges for analytics queries
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { getStartAndEndDatesFromFilter, getDateRangeFromFilter } from '@/lib/utils/dateUtils';
import type { TimeFilterOption, DateRange } from '@/lib/types';
import { DEFAULT_TIME_FILTER } from '@/lib/constants';

export interface UseTimeFilterReturn {
  /** Currently selected time filter */
  selectedFilter: TimeFilterOption;
  /** Function to update the selected filter */
  setSelectedFilter: (filter: TimeFilterOption) => void;
  /** Date range as a tuple [startDate, endDate] */
  dateRange: [string | null, string | null];
  /** Start date (null for "All Time") */
  startDate: string | null;
  /** End date (null for "All Time") */
  endDate: string | null;
  /** Date range as an object */
  dateRangeObject: DateRange;
}

/**
 * Custom hook for managing time filter state
 *
 * @param initialFilter - Initial filter value (default: 'Last 7 Days')
 * @returns Time filter state and utilities
 *
 * @example
 * ```tsx
 * const { selectedFilter, setSelectedFilter, startDate, endDate } = useTimeFilter();
 *
 * // Use in a Select component
 * <Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
 *   {TIME_FILTER_OPTIONS.map(option => (
 *     <MenuItem value={option}>{option}</MenuItem>
 *   ))}
 * </Select>
 *
 * // Use dates in API calls
 * fetchData(startDate, endDate);
 * ```
 */
export function useTimeFilter(
  initialFilter: TimeFilterOption = DEFAULT_TIME_FILTER
): UseTimeFilterReturn {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilterOption>(initialFilter);

  // Memoize date range calculation
  const dateRange = useMemo(
    () => getStartAndEndDatesFromFilter(selectedFilter),
    [selectedFilter]
  );

  const dateRangeObject = useMemo(
    () => getDateRangeFromFilter(selectedFilter),
    [selectedFilter]
  );

  return {
    selectedFilter,
    setSelectedFilter: useCallback((filter: TimeFilterOption) => {
      setSelectedFilter(filter);
    }, []),
    dateRange,
    startDate: dateRange[0],
    endDate: dateRange[1],
    dateRangeObject,
  };
}
