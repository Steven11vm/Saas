import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { InfoOutlined, CheckCircle, Code, Http, Security } from '@mui/icons-material';

const STORAGE_KEY = 'saas-portfolio-modal-seen';

export function PortfolioModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0 }}>
        <InfoOutlined color="primary" />
        Cómo funciona StockFlow
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Proyecto de portafolio. Los datos están en memoria en el servidor (se pierden al reiniciar). Auth con cookies (JWT + refresh tokens).
        </Alert>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Code fontSize="small" /> Flujo de la API (Backend)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Cada acción del frontend llama al backend así: <strong>Routes → Controllers → Services → Repositories</strong>. Ejemplo: al listar inventario, el front hace <code>GET /api/inventory</code>; el backend pasa por la ruta, el controlador llama al servicio y el servicio al repositorio (store en memoria). No hay base de datos real.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Http fontSize="small" /> Llamadas desde el frontend
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          El frontend usa un cliente en <code>api/client.js</code>: todas las peticiones van a <code>/api/...</code> con <code>credentials: 'include'</code> para enviar las cookies. Si el servidor responde 401, se intenta refrescar el token con <code>POST /api/auth/refresh</code> y se reenvía la petición; si falla, se cierra sesión.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Security fontSize="small" /> Autenticación
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Login y registro guardan <strong>accessToken</strong> y <strong>refreshToken</strong> en cookies httpOnly. El backend valida el token en cada petición protegida. Admin puede además cambiar el estado de las órdenes; el resto de la app (crear productos, órdenes, etc.) está disponible para cualquier usuario autenticado.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Puedes <strong>registrarte</strong> (admin o empleado), crear <strong>productos</strong> en Inventario, subir imagen opcional, y crear <strong>órdenes</strong> en Órdenes (expiran a los 30 min).
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="contained" color="primary">
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
