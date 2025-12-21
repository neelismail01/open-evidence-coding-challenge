'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Link,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useSnackbar } from '@/lib/hooks/useSnackbar';
import {
  StyledContainer,
  FormBox,
  StyledButton,
  StyledTextField,
  StyledFormControl
} from '@/app/components/AuthComponents';

interface Company {
  id: number;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { snackbar, showError, showSuccess, hideSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies || []);
      } else {
        showError('Failed to load companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showError('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyChange = (event: SelectChangeEvent) => {
    setCompanyId(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          company_id: parseInt(companyId)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      showSuccess('Account created successfully!');

      // Redirect to advertiser page for their company
      setTimeout(() => {
        router.push(`/advertiser?companyId=${data.companyId}`);
      }, 1000);
    } catch (error) {
      console.error('Signup error:', error);
      showError('An error occurred during signup');
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
          Create your account to manage advertising campaigns
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
            autoComplete="new-password"
          />
          <StyledFormControl fullWidth required>
            <InputLabel>Company</InputLabel>
            <Select
              value={companyId}
              onChange={handleCompanyChange}
              label="Company"
              disabled={loadingCompanies}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#252626',
                    color: 'white',
                  },
                },
              }}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          <StyledButton type="submit" disabled={loading || loadingCompanies}>
            {loading ? 'Creating account...' : 'Create Account'}
          </StyledButton>
        </form>
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '14px', color: 'white' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              sx={{
                color: '#d45b15',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Login
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
