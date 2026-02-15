import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/store.js';
import { ROLES } from '../config/constants.js';

export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  const user = userRepository.findById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }
  req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sin permisos para esta acción' });
    }
    next();
  };
}

export const requireAdmin = requireRole(ROLES.ADMIN);
