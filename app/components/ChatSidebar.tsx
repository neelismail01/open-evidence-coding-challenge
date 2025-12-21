'use client';

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '50px',
  borderRight: '0.1px solid #3b3b3b',
});

const StyledNewChatIconButton = styled(IconButton)({
  padding: '4px',
  backgroundColor: '#d45b15',
  height: '25px',
  width: '25px',
  borderRadius: '12.5px',
  color: 'white',
  marginTop: '20px',
  '&:hover': {
    backgroundColor: '#963e0b',
  }
});

const StyledMenuIconButton = styled(IconButton)({
  color: 'white',
  marginBottom: '20px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});

interface HeaderProps {
  handleNewConversation: () => void;
  handleLogout?: () => void;
  tooltipText?: string;
}

export default function ChatSidebar({ handleNewConversation, handleLogout, tooltipText }: HeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdvertiserLogin = () => {
    handleMenuClose();
    router.push('/login');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    if (handleLogout) {
      handleLogout();
    }
  };

  return (
    <StyledBox>
      <Tooltip title={tooltipText || 'New Chat'} placement='right'>
        <StyledNewChatIconButton>
          <AddIcon style={{ fontSize: '16px' }} onClick={handleNewConversation} />
        </StyledNewChatIconButton>
      </Tooltip>
      <StyledMenuIconButton
        onClick={handleMenuOpen}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MenuIcon style={{ fontSize: '20px' }} />
      </StyledMenuIconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '15px',
            backgroundColor: '#2a2a2a',
            color: 'white',
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }
          }
        }}
      >
        {handleLogout ? (
          <MenuItem style={{ marginRight: '30px' }} onClick={handleLogoutClick}>
            <IconButton sx={{ padding: '2px', marginLeft: '-4px' }}>
              <LogoutIcon style={{ color: 'white', fontSize: '16px' }} />
            </IconButton>
            <Typography style={{ color: 'white', fontSize: '14px', marginLeft: '10px' }}>
              Logout
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem style={{ marginRight: '30px' }} onClick={handleAdvertiserLogin}>
            <IconButton sx={{ padding: '2px', marginLeft: '-4px' }}>
              <LoginIcon style={{ color: 'white', fontSize: '16px' }} />
            </IconButton>
            <Typography style={{ color: 'white', fontSize: '14px', marginLeft: '10px' }}>
              Advertiser Login
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </StyledBox>
  );
}
