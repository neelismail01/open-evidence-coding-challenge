'use client';

import { Box, Paper, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect } from 'react';
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
  padding: '0.25rem 0.25rem',
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

const gradientFlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

const AnimatedThinkingText = styled(Typography)({
  background: 'linear-gradient(90deg, #888888 0%, #ffffff 25%, #ffffff 50%, #888888 75%, #888888 100%)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${gradientFlow} 2s linear infinite`,
  fontWeight: 500
});

interface ConversationHistoryProps {
  history: HistoryItem[];
  streamingContent?: string;
  onAdClick?: (ad: Ad) => void;
  onAdImpression?: (ad: Ad) => void;
  currentAd?: Ad | null;
  latestQuestionRef?: React.RefObject<HTMLDivElement>;
}

function ConversationHistoryItem({
  role,
  content,
  questionRef
}: HistoryItem & { questionRef?: React.RefObject<HTMLDivElement> }) {
  if (role == 'user') {
    return (
      <Box display="flex" justifyContent="flex-end" marginTop="10px" ref={questionRef}>
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
  currentAd,
  latestQuestionRef
}: ConversationHistoryProps) {

  const lastUserIndex = history.length > 0
    ? history.map((item, idx) => item.role === 'user' ? idx : -1).filter(idx => idx !== -1).pop()
    : -1;

  // Scroll to the latest question when history changes
  useEffect(() => {
    if (latestQuestionRef?.current) {
      latestQuestionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [history.length, latestQuestionRef]);

  // Group messages into Q&A pairs
  const conversationPairs: Array<{userMessage: HistoryItem, userIndex: number, assistantMessage?: HistoryItem}> = [];

  history.forEach((item, index) => {
    if (item.role === 'user') {
      conversationPairs.push({
        userMessage: item,
        userIndex: index,
        assistantMessage: undefined
      });
    } else if (item.role === 'assistant' && conversationPairs.length > 0) {
      conversationPairs[conversationPairs.length - 1].assistantMessage = item;
    }
  });

  return (
    <Box sx={{mb: 15}}>
      {conversationPairs.map((pair, pairIndex) => {
        const isLastUser = pair.userIndex === lastUserIndex;
        const showFullAd = currentAd && isLastUser;
        const isLastPair = pairIndex === conversationPairs.length - 1;

        return (
          <Box
            key={pair.userIndex}
            sx={{
              minHeight: isLastUser ? '100vh' : 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            ref={isLastUser ? latestQuestionRef : undefined}
          >
            {/* User question */}
            <ConversationHistoryItem
              {...pair.userMessage}
            />

            {/* Render ad right after user message */}
            {pair.userMessage.ad && (
              <>
                {showFullAd ? (
                  <>
                    <AdvertisementCard
                      ad={pair.userMessage.ad}
                      onAdImpression={onAdImpression}
                      onAdClick={onAdClick}
                    />
                    <Box sx={{ textAlign: 'left', mt: 4 }}>
                      <AnimatedThinkingText>
                        Thinking...
                      </AnimatedThinkingText>
                    </Box>
                  </>
                ) : (
                  <FoldedAdvertisementCard ad={pair.userMessage.ad} onAdClick={onAdClick} />
                )}
              </>
            )}

            {/* Assistant response */}
            {pair.assistantMessage && (
              <ConversationHistoryItem
                {...pair.assistantMessage}
              />
            )}

            {/* Show streaming content if this is the last pair and we're streaming */}
            {isLastPair && streamingContent && (
              <StyledAssistantPaper elevation={2}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingContent}
                </ReactMarkdown>
              </StyledAssistantPaper>
            )}
          </Box>
        );
      })}
    </Box>
  );
}