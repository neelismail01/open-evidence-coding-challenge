'use client';
import { useEffect, useState } from 'react';
import { Typography, Paper, Button, Box, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  padding: '0.75rem 1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  backgroundColor: '#2a2a2a',
  color: 'white',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#333',
  },
});

const ExpandIcon = styled(IconButton)<{ expanded: boolean }>(({ expanded }) => ({
  color: 'white',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s',
  marginLeft: 'auto',
}));

interface AdvertisementCardProps {
  ad: Ad | null;
  onAdImpression?: (ad: Ad) => void;
  onAdClick?: (ad: Ad) => void;
  initiallyExpanded?: boolean;
}

interface FoldedAdvertisementCardProps {
  ad: Ad;
  onAdClick?: (ad: Ad) => void;
}

function UnifiedAdvertisementCard({ ad, onAdClick, onAdImpression, initiallyExpanded = false }: AdvertisementCardProps & { ad: Ad }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  useEffect(() => {
    // Track impression when ad is shown (only for initially expanded ads)
    if (initiallyExpanded && ad && ad.id && onAdImpression) {
      onAdImpression(ad);
    }
  }, [ad, onAdImpression, initiallyExpanded]);

  const handleAdClick = () => {
    if (ad && ad.id && onAdClick) {
      onAdClick(ad);
    }
  };

  return (
    <StyledAdCard elevation={2}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
            Sponsored
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
            {ad.campaigns.treatment_name}
          </Typography>
        </Box>
        <ExpandIcon expanded={expanded} size="small">
          <ExpandMoreIcon />
        </ExpandIcon>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #444' }}>
          <Typography variant="body2" paragraph sx={{ color: '#ddd' }}>
            {ad.campaigns.description}
          </Typography>
          <Button
            variant="contained"
            size="small"
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
              marginTop: '0.75rem',
              color: '#999',
              fontSize: '0.7rem',
            }}
          >
            Sponsored by {ad.campaigns.companies.name}
          </Typography>
        </Box>
      </Collapse>
    </StyledAdCard>
  );
}

export function FoldedAdvertisementCard({ ad, onAdClick }: FoldedAdvertisementCardProps) {
  return <UnifiedAdvertisementCard ad={ad} onAdClick={onAdClick} initiallyExpanded={false} />;
}

export default function AdvertisementCard({ ad, onAdImpression, onAdClick, initiallyExpanded = true }: AdvertisementCardProps) {
  if (ad === null) {
    return (
      <StyledAdCard sx={{ mt: 2 }}>
        <LoadingIndicator />
      </StyledAdCard>
    );
  }

  return (
    <UnifiedAdvertisementCard
      ad={ad}
      onAdClick={onAdClick}
      onAdImpression={onAdImpression}
      initiallyExpanded={initiallyExpanded}
    />
  );
}
