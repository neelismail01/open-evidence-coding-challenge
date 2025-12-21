'use client';

import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdvertisementCard, { FoldedAdvertisementCard } from './AdvertisementCard';

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

interface HistoryItem {
  role: string;
  content: string;
  ad?: Ad;
}

const StyledUserPaper = styled(Paper)({
  padding: '0.1rem 1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  borderRadius: '12px',
  backgroundColor: '#262626',
  color: 'white',
  lineHeight: '1.6',
  fontSize: '15px'
});

const StyledAssistantPaper = styled(Paper)({
  padding: '1.25rem 1.5rem',
  marginBottom: '1.5rem',
  borderRadius: '12px',
  backgroundColor: 'transparent',
  color: 'white',
  lineHeight: '1.7',
  fontSize: '15px',
  '& p': {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    lineHeight: '1.7'
  },
  '& ul, & ol': {
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
    paddingLeft: '1.5rem'
  },
  '& li': {
    marginBottom: '0.5rem',
    lineHeight: '1.7'
  },
  '& strong': {
    fontWeight: 600
  },
  '& code': {
    backgroundColor: '#1a1a1a',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '14px'
  },
  '& pre': {
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    borderRadius: '6px',
    overflowX: 'auto',
    marginTop: '0.75rem',
    marginBottom: '0.75rem'
  }
});

interface ConversationHistoryProps {
  history: HistoryItem[];
  streamingContent?: string;
  onAdClick?: (ad: Ad) => void;
  onAdImpression?: (ad: Ad) => void;
  currentAd?: Ad | null;
}

interface ConversationHistoryItemProps extends HistoryItem {
  onAdClick?: (ad: Ad) => void;
  onAdImpression?: (ad: Ad) => void;
  showFullAd?: boolean;
}

function ConversationHistoryItem({
  role,
  content,
  ad,
  onAdClick,
  onAdImpression,
  showFullAd
}: ConversationHistoryItemProps) {
  if (role == 'user') {
    return (
      <Box display="flex" justifyContent="flex-end" marginTop="10px">
        <StyledUserPaper elevation={3} style={{ width: 'fit-content', maxWidth: '80%' }}>
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </StyledUserPaper>
      </Box>
    )
  }

  return (
    <StyledAssistantPaper style={{marginBottom: '25px'}} elevation={2}>
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </StyledAssistantPaper>
  )
}

export default function ConversationHistory({
  history,
  streamingContent,
  onAdClick,
  onAdImpression,
  currentAd
}: ConversationHistoryProps) {
  // Find the index of the last user message to show the full ad
  const lastUserIndex = history.length > 0
    ? history.map((item, idx) => item.role === 'user' ? idx : -1).filter(idx => idx !== -1).pop()
    : -1;

  return (
    <Box>
      {history.map((item, index) => {
        const isLastUser = index === lastUserIndex && item.role === 'user';
        const showFullAd = currentAd && isLastUser;
        return (
          <Box key={index}>
            <ConversationHistoryItem
              {...item}
              onAdClick={onAdClick}
              onAdImpression={onAdImpression}
              showFullAd={showFullAd}
            />
            {/* Render ad right after user message */}
            {item.role === 'user' && item.ad && (
              <>
                {showFullAd ? (
                  <>
                    <AdvertisementCard
                      ad={item.ad}
                      onAdImpression={onAdImpression}
                      onAdClick={onAdClick}
                    />
                    <Box sx={{ textAlign: 'left', mt: 2 }}>
                      <Typography color="white">
                        Thinking about this response...
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <FoldedAdvertisementCard ad={item.ad} onAdClick={onAdClick} />
                )}
              </>
            )}
          </Box>
        );
      })}
      {streamingContent && (
        <StyledAssistantPaper elevation={2}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {streamingContent}
          </ReactMarkdown>
        </StyledAssistantPaper>
      )}
    </Box>
  );
}

