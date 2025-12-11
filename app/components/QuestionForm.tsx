'use client';

import { Button, Paper, TextField } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)({
  padding: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  fontFamily: 'Open Sans, sans-serif',
});

const StyledButton = styled(Button)({
  height: '56px', // to match TextField height
});

interface QuestionFormProps {
  question: string;
  setQuestion: (question: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
  loading: boolean;
}

export default function QuestionForm({ question, setQuestion, handleSubmit, loading }: QuestionFormProps) {
  return (
    <StyledPaper elevation={3}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TextField
          label="Ask a question"
          variant="outlined"
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}  // Disable input while loading
        />
        <StyledButton type="submit" variant="contained" color="primary" disabled={loading}>
          Ask
        </StyledButton>
      </form>
    </StyledPaper>
  );
}
