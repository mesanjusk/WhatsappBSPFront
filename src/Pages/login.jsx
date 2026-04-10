import { useEffect, useState } from 'react';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { toast } from '../Components/Toast';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.WHATSAPP, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorText('');

    try {
      const response = await apiClient.post('/user/login', {
        User_name: userName,
        Password: password,
      });

      const data = response?.data || {};

      if (data.status === 'notexist') return void setErrorText('User has not signed up.');
      if (data.status === 'invalid') return void setErrorText('Invalid credentials. Please check username and password.');
      if (!data.token) return void setErrorText('Login succeeded but token was not received from the server.');

      login(data.token, {
        userName,
        userGroup: data.userGroup || '',
        mobileNumber: data.userMobile || data.userMob || '',
      });

      toast.success('Login successful.');
      navigate(ROUTES.WHATSAPP, { replace: true });
    } catch {
      setErrorText('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr minmax(420px, 520px)' },
        bgcolor: '#111b21',
      }}
    >
      <Stack
        sx={{
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 6,
          color: '#e9edef',
          background: 'linear-gradient(160deg, #0b141a 0%, #111b21 50%, #10352f 100%)',
        }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ChatRoundedIcon sx={{ color: '#25d366', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>WhatsApp BSP</Typography>
        </Stack>
        <Typography variant="h6" sx={{ maxWidth: 540 }}>
          Manage customer conversations, broadcast campaigns, templates, and automation from a single WhatsApp-native workspace.
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, md: 3 } }}>
        <Paper sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
          <Stack spacing={3} component="form" onSubmit={submit}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Sign in
              </Typography>
              <Typography color="text.secondary">Access your WhatsApp Business workspace.</Typography>
            </Box>

            {errorText ? <Alert severity="error">{errorText}</Alert> : null}

            <TextField
              label="User Name"
              autoComplete="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}
            >
              {loading ? 'Please wait...' : 'Continue'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
