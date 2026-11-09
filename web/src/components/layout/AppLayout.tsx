import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../../features/auth/hooks/useAuth';
import { logoutUser } from '../../features/auth/services/authService';
import { NAV_ITEMS } from './navItems';

const DRAWER_WIDTH = 240;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <List component="nav" aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => (
        <ListItemButton
          key={item.to}
          component={NavLink}
          to={item.to}
          onClick={onNavigate}
          sx={{
            '&.active': {
              bgcolor: 'action.selected',
              '& .MuiListItemIcon-root': { color: 'primary.main' },
              '& .MuiListItemText-primary': { fontWeight: 600 },
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}

/** Estrutura das telas autenticadas: barra superior + navegação lateral. */
export function AppLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box className="flex min-h-screen">
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar className="gap-2">
          <IconButton
            edge="start"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h3" component="span" className="grow">
            Sendflow
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user?.displayName ?? user?.email}
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => void logoutUser()}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <Toolbar />
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        <Toolbar />
        <NavList />
      </Drawer>

      <Box component="main" className="min-w-0 flex-1 p-4 md:p-6">
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
