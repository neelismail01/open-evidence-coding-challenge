'use client';

import { 
  Button, 
  Box, 
  FormControl,
  MenuItem, 
  Select,
  SelectChangeEvent
} from '@mui/material';
import { styled } from '@mui/system';
import { ADVERTISER_MODE, PHYSICIAN_MODE } from '../constants';

const StyledBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  borderBottomWidth: '0.25px',
  borderBottomColor: '#636363',
  borderBottomStyle: 'solid'
});

const StyledButton = styled(Button)({
  borderRadius: '10px',
  backgroundColor: '#d45b15',
  border: '1px solid #d45b15',
  width: '125px',
  marginRight: '20px',
  marginTop: '10px',
  marginBottom: '10px',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#d45b15',
  },
});

interface HeaderProps {
  mode: string;
  handleNewMode: (event: SelectChangeEvent) => void;
  handleNewConversation: () => void;
  showNewChatButton: boolean;
}

export default function Header({ mode, handleNewMode, handleNewConversation, showNewChatButton }: HeaderProps) {
  
  return (
    <StyledBox>
      <FormControl style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px' }}>
        <Select
          value={mode}
          onChange={handleNewMode}
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{
            color: 'white',
            '& .MuiSelect-icon': {
              color: 'white',
            },
            '&.Mui-focused': {
              backgroundColor: 'transparent',
            },
            // Hide the default Material-UI focus outline
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            // For standard variant, remove the bottom line on focus
            '&:after': {
              borderBottom: 'none',
            },
            '&:before': {
              borderBottom: 'none',
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottom: 'none',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#252626',
                color: 'white',
              },
            },
          }}
        >
          <MenuItem value={PHYSICIAN_MODE}>Physician Mode</MenuItem>
          <MenuItem value={ADVERTISER_MODE}>Advertiser Mode</MenuItem>
        </Select>
      </FormControl>
      {showNewChatButton && <StyledButton
        color="inherit"
        onClick={handleNewConversation}>
          New Chat
      </StyledButton>}
    </StyledBox>
  );
}
