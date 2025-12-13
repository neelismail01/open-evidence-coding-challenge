'use client';

import { Box, Typography, Paper, Button } from '@mui/material';
import LoadingIndicator from './LoadingIndicator'; // Import the existing LoadingIndicator
import { styled } from '@mui/system';

const StyledAdCard = styled(Paper)({
  padding: '1.5rem',
  marginTop: '2rem',
  marginBottom: '2rem',
  backgroundColor: '#333',
  color: 'white',
  textAlign: 'center',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '25px',
});

interface Ad {
  id: number;
  company: string;
  headline: string;
  body: string;
  cta: string;
  url: string;
}

interface AdvertisementCardProps {
  ad: Ad | null;
}

export default function AdvertisementCard({ ad }: AdvertisementCardProps) {
  return (
    <StyledAdCard elevation={10}>
      {ad ? (
        <>
          <Typography variant="h6" component="h3" gutterBottom>
            {ad.headline}
          </Typography>
          <Typography variant="body2" paragraph>
            {ad.body}
          </Typography>
          <Button variant="contained" style={{ backgroundColor: "#d45b15", borderRadius: '20px' }} href={ad.url} target="_blank" rel="noopener noreferrer">
            {ad.cta}
          </Button>
        </>
      ) : (
        <Box mt={2}>
          <LoadingIndicator />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fetching advertisement...
          </Typography>
        </Box>
      )}
    </StyledAdCard>
  );
}
