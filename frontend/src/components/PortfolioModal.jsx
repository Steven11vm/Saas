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
import { InfoOutlined, CheckCircle } from '@mui/icons-material';

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
        Proyecto de portafolio
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Este es un proyecto de demostración para portafolio. Los datos se guardan en memoria en el servidor (no hay base de datos real) y se pierden al reiniciar. La autenticación usa cookies (JWT + refresh tokens).
        </Alert>
        <Typography variant="body2" color="text.secondary" paragraph>
          El objetivo es mostrar arquitectura limpia (routes → controllers → services → repositories), manejo de roles (Admin / Empleado), seguridad y un flujo real de APIs. Este proyecto está pensado para ser lo más perfecto posible: lo mejor que se pueda hacer a nivel técnico y que quede lo mejor posible en el aspecto visual.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Puedes registrar un usuario y elegir rol <strong>admin</strong> o <strong>empleado</strong> para probar permisos.
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
