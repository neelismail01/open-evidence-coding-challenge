/**
 * useSnackbar Hook
 * Manages snackbar/notification state with convenience methods
 */

'use client';

import { useState, useCallback } from 'react';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export interface UseSnackbarReturn {
  /** Current snackbar state */
  snackbar: SnackbarState;
  /** Show a snackbar with custom message and severity */
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  /** Hide the snackbar */
  hideSnackbar: () => void;
  /** Show a success snackbar */
  showSuccess: (message: string) => void;
  /** Show an error snackbar */
  showError: (message: string) => void;
  /** Show a warning snackbar */
  showWarning: (message: string) => void;
  /** Show an info snackbar */
  showInfo: (message: string) => void;
}

/**
 * Custom hook for managing snackbar notifications
 *
 * @returns Snackbar state and control functions
 *
 * @example
 * ```tsx
 * const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
 *
 * // Show notifications
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     showSuccess('Data saved successfully!');
 *   } catch (error) {
 *     showError('Failed to save data');
 *   }
 * };
 *
 * // Use with MUI Snackbar
 * <Snackbar
 *   open={snackbar.open}
 *   autoHideDuration={6000}
 *   onClose={hideSnackbar}
 * >
 *   <Alert severity={snackbar.severity} onClose={hideSnackbar}>
 *     {snackbar.message}
 *   </Alert>
 * </Snackbar>
 * ```
 */
export function useSnackbar(): UseSnackbarReturn {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
