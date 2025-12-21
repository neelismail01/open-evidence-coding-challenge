'use client';

import { Box, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';

const FormContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#333',
  borderRadius: '40px',
  padding: '10px 10px 10px 20px',
});

interface QuestionFormProps {
  question: string;
  setQuestion: (question: string) => void;
  chatStarted: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  loading: boolean;
}

export default function QuestionForm({ 
  question, 
  setQuestion,
  chatStarted, 
  handleSubmit, 
  loading 
} : QuestionFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        <TextField
          placeholder={chatStarted ? "Ask a follow-up question" : "Ask a question"}
          variant="standard"
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiInput-underline:before': {
              borderBottom: 'none',
            },
            '& .MuiInput-underline:after': {
              borderBottom: 'none',
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottom: 'none',
            },
          }}
        />
        <IconButton type="submit" color="primary" disabled={loading} sx={{ backgroundColor: '#d45b15', '&:hover': { backgroundColor: '#666' } }}>
          <SendIcon sx={{ color: 'white' }} />
        </IconButton>
      </FormContainer>
    </form>
  );
}
