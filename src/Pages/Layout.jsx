import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

export default function Layout() {
  const navigate = useNavigate();
  const { userName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 1.5, minHeight: '56px !important' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <ChatRoundedIcon sx={{ color: '#25d366' }} />
            <Typography variant="subtitle1" noWrap>
              WhatsApp Cloud Console
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" noWrap>
            {userName ? `Signed in as ${userName}` : 'Signed in'}
          </Typography>

          <Button
            color="inherit"
            size="small"
            startIcon={<LogoutRoundedIcon fontSize="small" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, px: { xs: 1, md: 1.5 }, py: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
