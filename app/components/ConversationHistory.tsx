'use client';

import { Box, List, Paper } from '@mui/material';
import { styled } from '@mui/system';

interface HistoryItem {
  role: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  borderRadius: '10px',
  backgroundColor: '#333',
  color: 'white'
});

interface ConversationHistoryProps {
  history: HistoryItem[];
}

function ConversationHistoryItem({ role, content }: HistoryItem) {
  if (role == 'user') {
    return (
      <StyledPaper elevation={3}>
        <Box
          component="div"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
        />
      </StyledPaper>
    )
  }
  
  return (
    <Box
      component="div"
      dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
      style={{ marginBottom: '3rem' }}
    />
  )
}

export default function ConversationHistory({ history }: ConversationHistoryProps) {
  return (
    <Box >
      {history.map((item, index) => (
        <ConversationHistoryItem key={index} {...item} />
      ))}
    </Box>
  );
}

