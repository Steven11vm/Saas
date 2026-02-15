import { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
            <ErrorOutline color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              La página no pudo cargar. Prueba volver al inicio o recargar.
            </Typography>
            <Button component={Link} to="/" variant="contained" startIcon={<Home />}>
              Ir al inicio
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
