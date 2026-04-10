import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../context/AuthContext';
import { SIDEBAR_GROUPS } from '../constants/sidebarMenu.jsx';

const DRAWER_WIDTH = 286;
const DRAWER_COLLAPSED = 72;

export default function Sidebar({ desktopCollapsed, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clearAuth } = useAuth();
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(SIDEBAR_GROUPS.map((group) => [group.label, true])));

  const groups = useMemo(() => SIDEBAR_GROUPS, []);

  const handleNavigate = (path) => {
    navigate(path);
    onCloseMobile();
  };

  const toggleGroup = (label) => {
    if (desktopCollapsed) return;
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    clearAuth();
    onCloseMobile();
    navigate('/');
  };

  const isSelected = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const drawerContent = (
    <Stack sx={{ height: '100%', bgcolor: '#0f172a', color: '#e2e8f0' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 1.1 }}>
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <Avatar sx={{ bgcolor: '#38bdf8', color: '#0f172a', width: 34, height: 34, fontWeight: 800 }}>M</Avatar>
          {!desktopCollapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap color="#f8fafc">MIS Pro</Typography>
              <Typography variant="caption" color="rgba(226,232,240,0.72)" noWrap>Orders, reports, WhatsApp Cloud</Typography>
            </Box>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ borderColor: 'rgba(148,163,184,0.18)' }} />

      <List sx={{ py: 0.75, px: 0.75, overflowY: 'auto', flexGrow: 1 }}>
        {groups.map((group) => (
          <Box key={group.label} sx={{ mb: 0.75 }}>
            {!desktopCollapsed && (
              <ListItemButton onClick={() => toggleGroup(group.label)} sx={{ minHeight: 32, borderRadius: 2 }}>
                <ListItemText
                  primary={group.label}
                  primaryTypographyProps={{ variant: 'caption', fontWeight: 700, sx: { letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(226,232,240,0.62)' } }}
                />
                {openGroups[group.label] ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
              </ListItemButton>
            )}

            <Collapse in={desktopCollapsed || openGroups[group.label]} timeout="auto" unmountOnExit={false}>
              {group.items.map((item) => {
                const selected = isSelected(item.path);
                return (
                  <Tooltip key={item.path} title={desktopCollapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      selected={selected}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        minHeight: 36,
                        ml: desktopCollapsed ? 0 : 1,
                        mb: 0.45,
                        borderRadius: 2,
                        '&.Mui-selected': { bgcolor: 'rgba(56,189,248,0.18)', color: '#f8fafc' },
                        '&:hover': { bgcolor: 'rgba(56,189,248,0.10)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, color: selected ? '#38bdf8' : 'rgba(226,232,240,0.72)' }}>
                        {item.icon}
                      </ListItemIcon>
                      {!desktopCollapsed && (
                        <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true }} />
                      )}
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </Collapse>
          </Box>
        ))}
      </List>

      <Box sx={{ p: 1 }}>
        <Button fullWidth color="inherit" variant="outlined" startIcon={<LogoutRoundedIcon fontSize="small" />} onClick={handleLogout}>
          {!desktopCollapsed ? 'Logout' : ''}
        </Button>
      </Box>
    </Stack>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopCollapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: desktopCollapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width'),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

Sidebar.propTypes = {
  desktopCollapsed: PropTypes.bool,
  mobileOpen: PropTypes.bool,
  onCloseMobile: PropTypes.func,
};

Sidebar.defaultProps = {
  desktopCollapsed: false,
  mobileOpen: false,
  onCloseMobile: () => {},
};
