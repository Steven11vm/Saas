import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/store.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ROLES } from '../config/constants.js';

export async function register({ email, password, name, role = ROLES.EMPLEADO }) {
  const existing = userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('El correo ya está registrado');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepository.create({
    id: uuidv4(),
    email,
    password: hashedPassword,
    name: name || email.split('@')[0],
    role: role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.EMPLEADO,
    createdAt: new Date().toISOString(),
  });
  const { password: _, ...safe } = user;
  return { user: safe, accessToken: signAccessToken({ id: user.id, role: user.role }), refreshToken: signRefreshToken({ id: user.id }) };
}

export async function login({ email, password }) {
  const user = userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const { password: _, ...safe } = user;
  return { user: safe, accessToken: signAccessToken({ id: user.id, role: user.role }), refreshToken: signRefreshToken({ id: user.id }) };
}

export function refresh(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    const err = new Error('Refresh token inválido o expirado');
    err.code = 'INVALID_REFRESH';
    throw err;
  }
  const user = userRepository.findById(payload.id);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  return { accessToken: signAccessToken({ id: user.id, role: user.role }), refreshToken: signRefreshToken({ id: user.id }) };
}

export function getMe(userId) {
  const user = userRepository.findById(userId);
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}
