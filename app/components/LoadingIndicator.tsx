'use client';

import { Box, CircularProgress } from '@mui/material';

export default function LoadingIndicator() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
      <CircularProgress />
    </Box>
  );
}
