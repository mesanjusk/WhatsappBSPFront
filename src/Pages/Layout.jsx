import { Outlet, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Box, Fab, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TaskRoundedIcon from '@mui/icons-material/TaskRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import Sidebar from '../Components/Sidebar';
import TopNavbar from '../Components/TopNavbar';
import Footer from '../Components/Footer';
import FloatingButtons from '../Components/FloatingButtons';

import { ROUTES } from '../constants/routes';

const DRAWER_WIDTH = 258;
const DRAWER_COLLAPSED = 72;
const NAVBAR_HEIGHT = 56;

export default function Layout() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [desktopCollapsed, setDesktopCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const buttonsList = useMemo(
    () => [
      { onClick: () => navigate(ROUTES.ORDERS_NEW), label: 'Order' },
      { onClick: () => navigate(ROUTES.RECEIPT), label: 'Receipt' },
      { onClick: () => navigate(ROUTES.PAYMENT), label: 'Payment' },
      { onClick: () => navigate(ROUTES.FOLLOWUPS), label: 'Followups' },
      { onClick: () => navigate(ROUTES.TASKS_NEW), label: 'Task' },
    ],
    [navigate],
  );

  const utilityActions = useMemo(
    () => [
      { label: 'Refresh', onClick: () => window.location.reload(), icon: <RefreshRoundedIcon fontSize="small" /> },
      { label: 'Tasks', onClick: () => navigate(ROUTES.PENDING_TASKS), icon: <TaskRoundedIcon fontSize="small" /> },
      { label: 'WhatsApp', onClick: () => navigate(ROUTES.WHATSAPP), icon: <ChatRoundedIcon fontSize="small" /> },
      { label: 'Transactions', onClick: () => navigate(ROUTES.ALL_TRANSACTION), icon: <ReceiptLongRoundedIcon fontSize="small" /> },
    ],
    [navigate],
  );

  const sidebarWidth = isDesktop ? (desktopCollapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH) : 0;

  return (
    <Box
      sx={{
        height: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        desktopCollapsed={desktopCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { md: `${sidebarWidth}px` },
          transition: (theme) => theme.transitions.create('margin-left'),
          pr: { lg: 6 },
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: { xs: 0, md: `${sidebarWidth}px` },
            right: 0,
            zIndex: 1200,
            transition: (theme) => theme.transitions.create(['left']),
          }}
        >
          <TopNavbar
            onToggleSidebar={() => setMobileOpen((prev) => !prev)}
            onToggleDesktopCollapse={() => setDesktopCollapsed((prev) => !prev)}
            desktopCollapsed={desktopCollapsed}
          />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: { xs: 0.5, md: 1 },
            pt: `${NAVBAR_HEIGHT + 8}px`,
            pb: { xs: 8.5, md: 1.5 },
            scrollBehavior: 'smooth',
          }}
        >
          <Box
            sx={{
              maxWidth: 1640,
              mx: 'auto',
              minHeight: `calc(100dvh - ${NAVBAR_HEIGHT + 24}px)`,
            }}
          >
            <Outlet />
          </Box>
          <Footer />
        </Box>

        <FloatingButtons buttonsList={buttonsList} />
      </Box>

      

      <Fab
        color="primary"
        aria-label="open menu"
        onClick={() => setMobileOpen(true)}
        size="small"
        sx={{
          position: 'fixed',
          left: 10,
          bottom: 70,
          display: { xs: 'flex', md: 'none' },
          zIndex: 1199,
        }}
      >
        <AddIcon fontSize="small" />
      </Fab>
    </Box>
  );
}
