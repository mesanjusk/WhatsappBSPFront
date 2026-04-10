import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Breadcrumbs,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const titleFromPath = (pathname = '/home') => {
  const segment = pathname.split('/').filter(Boolean).at(-1) || 'home';
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function TopNavbar({ onToggleSidebar, onToggleDesktopCollapse, desktopCollapsed }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userName, userGroup, clearAuth } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const tabs = useMemo(
    () => [
      { label: 'Home', path: ROUTES.HOME, icon: <HomeRoundedIcon sx={{ fontSize: 15 }} /> },
      { label: 'Orders', path: '/allOrder', icon: <AssignmentRoundedIcon sx={{ fontSize: 15 }} /> },
      { label: 'Transactions', path: ROUTES.ALL_TRANSACTION, icon: <ReceiptLongRoundedIcon sx={{ fontSize: 15 }} /> },
      { label: 'WhatsApp', path: ROUTES.WHATSAPP, icon: <ChatRoundedIcon sx={{ fontSize: 15 }} /> },
    ],
    [],
  );

  useEffect(() => {
    if (!userName) navigate(ROUTES.LOGIN);
  }, [navigate, userName]);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.ROOT);
  };

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 54, md: 56 }, px: { xs: 1, md: 1.5 }, gap: 0.75 }}>
        <IconButton onClick={onToggleSidebar} sx={{ display: { md: 'none' } }}>
          <MenuRoundedIcon fontSize="small" />
        </IconButton>

        <IconButton onClick={onToggleDesktopCollapse} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
          {desktopCollapsed ? <MenuRoundedIcon fontSize="small" /> : <MenuOpenRoundedIcon fontSize="small" />}
        </IconButton>

        <Stack sx={{ minWidth: 0, pr: 1, maxWidth: { xs: 170, sm: 260, md: 340 } }}>
          <Typography variant="subtitle1" noWrap>
            SK 
          </Typography>
          <Breadcrumbs separator={<NavigateNextRoundedIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
            <Typography variant="caption" color="text.secondary">Workspace</Typography>
            <Typography variant="caption" color="text.primary" noWrap>{titleFromPath(pathname)}</Typography>
          </Breadcrumbs>
        </Stack>

        <TextField
          size="small"
          placeholder="Search customer, order, payment..."
          sx={{ display: { xs: 'none', lg: 'flex' }, minWidth: 240, maxWidth: 340, ml: 'auto' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', xl: 'flex' } }}>
          {tabs.map((tab) => (
            <Chip
              key={tab.path}
              clickable
              size="small"
              icon={tab.icon}
              label={<NavLink style={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }} to={tab.path}>{tab.label}</NavLink>}
              variant={pathname === tab.path ? 'filled' : 'outlined'}
              color={pathname === tab.path ? 'primary' : 'default'}
            />
          ))}
        </Stack>

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<HomeRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate(ROUTES.HOME)}
          sx={{ ml: { xs: 'auto', lg: 0 }, display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Home
        </Button>

        <IconButton aria-label="notifications" sx={{ ml: { lg: 0.5, xl: 0 } }}>
          <Badge color="primary" variant="dot">
            <NotificationsNoneRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>

        <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 30, height: 30, fontSize: 12 }}>
            {userName ? userName.slice(0, 2).toUpperCase() : 'NA'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{userName || 'Guest'}</Typography>
            <Typography variant="caption" color="text.secondary">{userGroup || 'Unknown role'}</Typography>
          </Box>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleLogout();
            }}
          >
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

TopNavbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onToggleDesktopCollapse: PropTypes.func.isRequired,
  desktopCollapsed: PropTypes.bool.isRequired,
};
