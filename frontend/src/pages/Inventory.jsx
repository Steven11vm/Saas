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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Inventory2, Image as ImageIcon } from '@mui/icons-material';
import { api, getUploadsUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', quantity: 0, minQuantity: 0, price: 0, description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const load = async () => {
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', sku: '', quantity: 0, minQuantity: 0, price: 0, description: '' });
    setImageFile(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      sku: item.sku || '',
      quantity: item.quantity ?? 0,
      minQuantity: item.minQuantity ?? 0,
      price: item.price ?? 0,
      description: item.description || '',
    });
    setImageFile(null);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.inventory.update(editing.id, form, imageFile || undefined);
      } else {
        await api.inventory.create(form, imageFile || undefined);
      }
      setOpen(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.inventory.delete(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const lowStock = (item) => item.minQuantity > 0 && item.quantity <= item.minQuantity;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Inventario
        </Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nuevo producto
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Cargando…</Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={getUploadsUrl(item.imageUrl) || 'https://placehold.co/400x200?text=Sin+imagen'}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    {lowStock(item) && (
                      <Chip size="small" color="warning" label="Bajo stock" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    SKU: {item.sku || '—'}
                  </Typography>
                  <Typography variant="body2">
                    Cantidad: <strong>{item.quantity}</strong>
                    {item.minQuantity > 0 && ` (mín. ${item.minQuantity})`}
                  </Typography>
                  <Typography variant="body2">
                    Precio: <strong>${Number(item.price).toLocaleString()}</strong>
                  </Typography>
                </CardContent>
                {isAdmin && (
                  <CardActions>
                    <Button size="small" startIcon={<Edit />} onClick={() => openEdit(item)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {items.length === 0 && !loading && (
        <Paper variant="outlined" sx={{ py: 8, textAlign: 'center' }}>
          <Inventory2 sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No hay productos. {isAdmin && 'Añade el primero.'}</Typography>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                type="number"
                label="Cantidad"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                inputProps={{ min: 0 }}
              />
              <TextField
                type="number"
                label="Mín. cantidad"
                value={form.minQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: Number(e.target.value) || 0 }))}
                inputProps={{ min: 0 }}
              />
              <TextField
                type="number"
                label="Precio"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
            <TextField
              fullWidth
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Button variant="outlined" component="label" startIcon={<ImageIcon />} fullWidth>
              {imageFile ? imageFile.name : 'Subir imagen'}
              <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0] || null)} />
            </Button>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
