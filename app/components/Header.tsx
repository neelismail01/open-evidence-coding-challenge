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
import { useRouter, usePathname } from 'next/navigation';
import { ADVERTISERS, ADVERTISER_MODE, PHYSICIAN_MODE } from '../../utils/constants';

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
  color: 'white',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#d45b15',
  },
});

interface HeaderProps {
  handleNewConversation: () => void;
  showNewChatButton: boolean;
  activeAdvertiser?: Advertiser | null;
  setActiveAdvertiser?: (advertiser: Advertiser) => void;
}

interface Advertiser {
  id: number;
  name: string;
}

export default function Header({
  handleNewConversation,
  showNewChatButton,
  activeAdvertiser,
  setActiveAdvertiser
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getModeFromPath = () => {
    if (pathname.startsWith('/advertiser')) {
      return ADVERTISER_MODE;
    }
    return PHYSICIAN_MODE;
  };

  const mode = getModeFromPath();

  const handleModeChange = (event: SelectChangeEvent) => {
    const newMode = event.target.value;
    if (newMode === ADVERTISER_MODE) {
      router.push('/advertiser');
    } else {
      router.push('/physician');
    }
  };

  return (
    <StyledBox>
      <FormControl style={{ marginLeft: '20px' }}>
        <Select
          value={mode}
          onChange={handleModeChange}
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
        onClick={handleNewConversation}>
        New Chat
      </StyledButton>}
      {mode == ADVERTISER_MODE && (
        <Box style={{ marginTop: '10px', marginLeft: '20px', marginBottom: '10px' }}>
          {ADVERTISERS.map((company: Advertiser) => (
            <Button
              key={company.id}
              variant={(activeAdvertiser === company) ? 'contained' : 'outlined'}
              onClick={() => setActiveAdvertiser && setActiveAdvertiser(company)}
              sx={{
                color: (activeAdvertiser === company) ? '#fff' : '#d45b15',
                backgroundColor: (activeAdvertiser === company) ? '#d45b15' : 'transparent',
                borderColor: '#d45b15',
                borderRadius: '20px',
                fontSize: '12px',
                paddingLeft: '5px',
                paddingRight: '5px',
                paddingTop: '2.5px',
                paddingBottom: '2.5px',
                marginRight: '10px',
                '&:hover': {
                  backgroundColor: (activeAdvertiser === company) ? '#b34711' : 'rgba(212, 91, 21, 0.04)',
                  borderColor: '#b34711',
                }
              }}
            >
              {company.name}
            </Button>
          ))}
        </Box>
      )}

    </StyledBox>
  );
}
