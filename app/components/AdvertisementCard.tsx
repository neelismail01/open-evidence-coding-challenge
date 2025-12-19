'use client';
import { useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import LoadingIndicator from './LoadingIndicator';
import { styled } from '@mui/system';

interface Company {
  name: string;
}

interface Campaign {
  companies: Company;
  description: string;
  id: number;
  product_url: string | null;
  treatment_name: string;
}

interface Ad {
  id: number;
  campaign_id: number;
  campaigns: Campaign;
  bid: number;
}

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

interface AdvertisementCardProps {
  ad: Ad | null;
  onAdImpression?: (ad: Ad) => void;
  onAdClick?: (ad: Ad) => void;
}

export default function AdvertisementCard({ ad, onAdImpression, onAdClick }: AdvertisementCardProps) {
  useEffect(() => {
    if (ad && ad.id && onAdImpression) {
      onAdImpression(ad);
    }
  }, [ad, onAdImpression]);

  const handleAdClick = () => {
    if (ad && ad.id && onAdClick) {
      onAdClick(ad);
    }
  }

  if (ad === null) {
    return (
      <StyledAdCard mt={2}>
        <LoadingIndicator />
      </StyledAdCard>
    );
  }

  return (
    <StyledAdCard elevation={10}>
      <Typography variant="h6" component="h3" gutterBottom>
        {ad.campaigns.treatment_name}
      </Typography>
      <Typography variant="body2" paragraph>
        {ad.campaigns.description}
      </Typography>
      <Button
        variant="contained"
        style={{ backgroundColor: "#d45b15", borderRadius: '20px' }}
        href={ad.campaigns.product_url || ''}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAdClick}
      >
        View Prescribing Information
      </Button>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          marginTop: '1rem',
          color: '#999',
          fontSize: '0.75rem',
        }}
      >
        Sponsored by {ad.campaigns.companies.name}
      </Typography>
    </StyledAdCard>
  );
}
