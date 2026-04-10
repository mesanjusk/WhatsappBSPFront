import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Box, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

export default function Layout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      {!isDesktop ? (
        <Box
          sx={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 1400,
            bgcolor: 'rgba(255,255,255,0.9)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
          }}
        >
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
      <Outlet context={{ onLogout: handleLogout }} />
    </Box>
  );
}
