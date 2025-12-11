'use client';

import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';

const FixedAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
});

interface HeaderProps {
  handleNewConversation: () => void;
}

export default function Header({ handleNewConversation }: HeaderProps) {
  return (
    <FixedAppBar position="static">
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <Typography variant="h6" style={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif' }}>
            Simple Ask
          </Typography>
          <Button color="inherit" onClick={handleNewConversation}>New Conversation</Button>
        </Toolbar>
      </Container>
    </FixedAppBar>
  );
}
