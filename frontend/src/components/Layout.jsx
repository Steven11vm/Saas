import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as OrdersIcon,
  Menu as MenuIcon,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const nav = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { to: '/orders', label: 'Órdenes', icon: <OrdersIcon /> },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorUser, setAnchorUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setAnchorUser(null);
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ py: 2, px: 1 }}>
      <Typography variant="h6" sx={{ px: 2, fontWeight: 700, color: 'primary.main' }}>
        StockFlow
      </Typography>
      <List sx={{ mt: 2 }}>
        {nav.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              '&.active': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.name || user?.email}
            </Typography>
            <IconButton onClick={(e) => setAnchorUser(e.currentTarget)} size="small">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={anchorUser} open={!!anchorUser} onClose={() => setAnchorUser(null)}>
        <MenuItem disabled>
          <Typography variant="body2">{user?.role === 'admin' ? 'Administrador' : 'Empleado'}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none', boxShadow: 2 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
