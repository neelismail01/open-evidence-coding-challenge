import { Container, Box, TextField, Button, FormControl } from '@mui/material';
import { styled } from '@mui/system';

export const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
});

export const FormBox = styled(Box)({
  backgroundColor: '#252626',
  padding: '40px',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '350px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

export const StyledButton = styled(Button)({
  borderRadius: '5px',
  backgroundColor: '#d45b15',
  border: '1px solid #d45b15',
  width: '100%',
  marginTop: '20px',
  padding: '12px',
  color: 'white',
  '&:hover': {
    backgroundColor: '#b34711',
  },
  '&:disabled': {
    backgroundColor: '#666',
    color: '#999',
  },
});

export const StyledTextField = styled(TextField)({
  marginBottom: '20px',
  fontSize: '16px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
        borderColor: '#5c5b5b',
    },
    '&:hover fieldset': {
        borderColor: '#d45b15',
    },
    '&.Mui-focused fieldset': {
        borderColor: '#d45b15',
    },
},
'& .MuiInputLabel-root': {
    color: '#ccc',
    fontSize: '14px',
    '&.Mui-focused': {
        color: '#d45b15'
    }
},
});

export const StyledFormControl = styled(FormControl)({
  marginBottom: '20px',
  '& .MuiInputBase-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: '#999',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#636363',
    },
    '&:hover fieldset': {
      borderColor: '#d45b15',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d45b15',
    },
  },
  '& .MuiSelect-icon': {
    color: '#999',
  },
});
