'use client';

import { Box, List, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';

interface HistoryItem {
  role: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  fontFamily: 'Open Sans, sans-serif',
});

interface ConversationHistoryProps {
  history: HistoryItem[];
}

export default function ConversationHistory({ history }: ConversationHistoryProps) {
  return (
    <List>
      {history.map((item, index) => (
        <StyledPaper elevation={3} key={index}>
          <Typography variant="body1" component="div">
            <strong>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}:</strong>
          </Typography>
          <Box 
            component="div" 
            dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} 
          />
        </StyledPaper>
      ))}
    </List>
  );
}

