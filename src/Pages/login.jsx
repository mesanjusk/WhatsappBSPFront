import { useEffect, useState } from 'react';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import MobileContainer from '../Components/MobileContainer';
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

      if (data.status === 'notexist') {
        setErrorText('User has not signed up.');
        return;
      }

      if (data.status === 'invalid') {
        setErrorText('Invalid credentials. Please check username and password.');
        return;
      }

      if (!data.token) {
        setErrorText('Login succeeded but token was not received from the server.');
        return;
      }

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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <MobileContainer maxWidth="sm">
        <Card sx={{ maxWidth: 460, mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={submit}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Welcome back
                </Typography>
                <Typography color="text.secondary">Sign in to access your WhatsApp dashboard.</Typography>
              </Box>

              {errorText && <Alert severity="error">{errorText}</Alert>}

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

              <Button type="submit" variant="contained" fullWidth disabled={loading} endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}>
                {loading ? 'Please wait...' : 'Sign In'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </MobileContainer>
    </Box>
  );
}
