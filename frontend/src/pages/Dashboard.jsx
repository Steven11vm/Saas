import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory2,
  TrendingUp,
  Warning,
  ReceiptLong,
  Schedule,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {subtitle != null && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color || 'primary.main'}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color: color || 'primary.main', fontSize: 28 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [m, o] = await Promise.all([api.orders.metrics(), api.orders.list()]);
        if (!cancelled) {
          setMetrics(m && typeof m === 'object' ? m : { orders: {}, totalRevenue: 0, inventoryTotal: 0, lowStockCount: 0 });
          setOrders(Array.isArray(o) ? o.slice(0, 8) : []);
        }
      } catch {
        if (!cancelled) {
          setMetrics({ orders: {}, totalRevenue: 0, inventoryTotal: 0, lowStockCount: 0 });
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const statusIcon = {
    pendiente: <Schedule fontSize="small" />,
    completada: <CheckCircle fontSize="small" />,
    expirada: <Cancel fontSize="small" />,
    cancelada: <Cancel fontSize="small" />,
  };
  const statusColor = {
    pendiente: 'warning',
    completada: 'success',
    expirada: 'default',
    cancelada: 'default',
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Órdenes pendientes"
            value={metrics?.orders?.pendientes ?? 0}
            icon={ShoppingCart}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Órdenes completadas"
            value={metrics?.orders?.completadas ?? 0}
            icon={ReceiptLong}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos totales"
            value={`$${(metrics?.totalRevenue ?? 0).toLocaleString()}`}
            icon={TrendingUp}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productos / Bajo stock"
            value={metrics?.inventoryTotal ?? 0}
            subtitle={metrics?.lowStockCount > 0 ? `${metrics.lowStockCount} con stock bajo` : null}
            icon={metrics?.lowStockCount > 0 ? Warning : Inventory2}
            color={metrics?.lowStockCount > 0 ? 'error.main' : 'primary.main'}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
        Últimas órdenes
      </Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay órdenes aún
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o.id.slice(0, 8)}…</TableCell>
                  <TableCell>${Number(o.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={statusIcon[o.status]}
                      label={o.status}
                      color={statusColor[o.status] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleString('es')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
