import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { Add, ReceiptLong, Schedule, CheckCircle, Cancel } from '@mui/icons-material';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  pendiente: { label: 'Pendiente', icon: Schedule, color: 'warning' },
  completada: { label: 'Completada', icon: CheckCircle, color: 'success' },
  expirada: { label: 'Expirada', icon: Cancel, color: 'default' },
  cancelada: { label: 'Cancelada', icon: Cancel, color: 'default' },
};

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const load = async () => {
    try {
      const [o, inv] = await Promise.all([api.orders.list(), api.inventory.list()]);
      setOrders(o);
      setInventory(inv);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item, qty = 1) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + qty } : c)));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, qty }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const createOrder = async () => {
    if (cart.length === 0) {
      setError('Añade al menos un producto');
      return;
    }
    setError('');
    try {
      await api.orders.create({
        items: cart.map((c) => ({ productId: c.id, name: c.name, quantity: c.qty, price: c.price })),
        total,
      });
      setCart([]);
      setOpenCreate(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.orders.updateStatus(id, status);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Órdenes
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
          Nueva orden
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Las órdenes pendientes expiran automáticamente a los 30 minutos.
      </Typography>

      {loading ? (
        <Typography>Cargando…</Typography>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Expira</TableCell>
                {isAdmin && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6 }}>
                    <ReceiptLong sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">No hay órdenes. Crea la primera.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => {
                  const config = statusConfig[o.status] || statusConfig.pendiente;
                  const Icon = config.icon;
                  return (
                    <TableRow key={o.id}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o.id.slice(0, 8)}…</TableCell>
                      <TableCell>{(o.items || []).length} item(s)</TableCell>
                      <TableCell>${Number(o.total).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip size="small" icon={<Icon />} label={config.label} color={config.color} />
                      </TableCell>
                      <TableCell>{new Date(o.expiresAt).toLocaleString('es')}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          {o.status === 'pendiente' ? (
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <InputLabel>Cambiar estado</InputLabel>
                              <Select
                                label="Cambiar estado"
                                value=""
                                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              >
                                <MenuItem value="completada">Completada</MenuItem>
                                <MenuItem value="cancelada">Cancelada</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>Nueva orden</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elige productos del inventario. La orden expirará en 30 minutos si no se completa.
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
            {inventory.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2">{item.name} — ${Number(item.price).toLocaleString()}</Typography>
                <Button size="small" onClick={() => addToCart(item)}>Añadir</Button>
              </Box>
            ))}
          </Box>
          <Typography variant="subtitle2">Carrito ({cart.length} productos)</Typography>
          {cart.map((c) => (
            <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2">{c.name} x{c.qty}</Typography>
              <Box>
                <Typography variant="body2" component="span">${(c.price * c.qty).toLocaleString()}</Typography>
                <Button size="small" color="error" onClick={() => removeFromCart(c.id)}>Quitar</Button>
              </Box>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>Total: ${total.toLocaleString()}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={createOrder} disabled={cart.length === 0}>
            Crear orden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
