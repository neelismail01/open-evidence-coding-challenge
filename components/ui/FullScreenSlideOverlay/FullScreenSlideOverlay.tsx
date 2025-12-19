/**
 * FullScreenSlideOverlay Component
 * Reusable full-screen overlay with slide-in animation
 *
 * Eliminates duplicate code from:
 * - app/advertiser/edit/[campaignId]/page.tsx (lines 942-973)
 * - app/advertiser/view/[campaignId]/page.tsx (lines 189-220)
 * Total: ~60 lines of duplication removed
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { colors, zIndex } from '@/theme';

export interface FullScreenSlideOverlayProps {
  /** Whether the overlay is currently open */
  isOpen: boolean;
  /** Callback when overlay should close */
  onClose: () => void;
  /** Content to display in the overlay */
  children: React.ReactNode;
  /** Optional title to display in the header */
  title?: string;
  /** Route to navigate to after closing (optional) */
  closeRoute?: string;
  /** Animation duration in milliseconds (default: 300) */
  animationDuration?: number;
  /** Show close button in header (default: true) */
  showCloseButton?: boolean;
}

/**
 * FullScreenSlideOverlay component for modal-like full-screen views
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <FullScreenSlideOverlay
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Campaign"
 *   closeRoute="/advertiser"
 * >
 *   <YourContent />
 * </FullScreenSlideOverlay>
 * ```
 */
export function FullScreenSlideOverlay({
  isOpen,
  onClose,
  children,
  title,
  closeRoute,
  animationDuration = 300,
  showCloseButton = true,
}: FullScreenSlideOverlayProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      if (closeRoute) {
        router.push(closeRoute);
      }
    }, animationDuration);
  };

  // Reset closing state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Don't render if not open and not closing
  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: colors.background.default,
        animation: isClosing
          ? `slideOutToRight ${animationDuration}ms ease-out forwards`
          : `slideInFromRight ${animationDuration}ms ease-out forwards`,
        '@keyframes slideInFromRight': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        '@keyframes slideOutToRight': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        p: 4,
        zIndex: zIndex.overlay,
        overflow: 'auto',
      }}
    >
      <Box style={{ margin: '20px auto' }}>
        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
          {/* Header with optional title and close button */}
          {(title || showCloseButton) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              {title && (
                <Typography variant="h6" sx={{ color: colors.text.primary }}>
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <IconButton
                  onClick={handleClose}
                  sx={{ color: colors.text.primary, ml: 'auto' }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          )}

          {/* Content */}
          {children}
        </Container>
      </Box>
    </Box>
  );
}
