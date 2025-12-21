'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Link
} from '@mui/material';
import { useSnackbar } from '@/lib/hooks/useSnackbar';
import {
  StyledContainer,
  FormBox,
  StyledButton,
  StyledTextField
} from '@/app/components/AuthComponents';

export default function LoginPage() {
  const router = useRouter();
  const { snackbar, showError, hideSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to advertiser page for their company
      router.push(`/advertiser?companyId=${data.companyId}`);
    } catch (error) {
      console.error('Login error:', error);
      showError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <StyledContainer>
      <FormBox>
        <Typography
          sx={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}
        >
          OpenEvidence
        </Typography>
        <Typography
          sx={{ color: 'white', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}
        >
          Please login to view advertising campaigns
        </Typography>
        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <StyledTextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <StyledButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Continue'}
          </StyledButton>
        </form>
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '14px', color: 'white' }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              sx={{
                color: '#d45b15',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </FormBox>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}
