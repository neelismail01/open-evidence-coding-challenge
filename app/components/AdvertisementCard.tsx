'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import LoadingIndicator from './LoadingIndicator';
import { styled } from '@mui/system';
import axios from 'axios';

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
  onAdComplete: () => void;
}

export default function AdvertisementCard({ ad, onAdComplete }: AdvertisementCardProps) {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (ad && ad.id) {
      setShowAd(true); // Reset showAd when a new ad arrives
      const timer = setTimeout(() => {
        setShowAd(false);
        onAdComplete();
      }, 5000);

      const recordImpression = async () => {
        try {
          await axios.post('/api/advertisement/impression', {
            campaign_category_id: ad.id,
            bid: ad.bid
          });
        } catch (error) {
          console.error('Error recording impression:', error);
        }
      };
      recordImpression();
      return () => clearTimeout(timer);
    }
  }, [ad, onAdComplete]);

  const handleAdClick = async () => {
    if (ad && ad.id) {
      try {
        await axios.post('/api/advertisement/clicks', {
          campaign_category_id: ad.id,
          bid: ad.bid
        });
      } catch (error) {
        console.error('Error recording ad click', error)
      }
    }
  }

  return (
    <>
      {ad === null ? (
        <Box mt={2}>
          <LoadingIndicator />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Fetching advertisement...
          </Typography>
        </Box>
      ) : showAd ? (
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
            Learn More
          </Button>
        </StyledAdCard>
      ) : (
        null
      )}
    </>
  );
}
