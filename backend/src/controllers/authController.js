import * as authService from '../services/authService.js';

// Cross-origin (Vercel ↔ Railway): sameSite debe ser 'none' y secure true
const isCrossOrigin = process.env.NODE_ENV === 'production' && process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: isCrossOrigin ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: isCrossOrigin ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000,
};

export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;
    const result = await authService.register({ email, password, name, role });
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user: result.user });
  } catch (e) {
    if (e.code === 'EMAIL_EXISTS') return res.status(409).json({ error: e.message });
    res.status(500).json({ error: e.message || 'Error al registrar' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ user: result.user });
  } catch (e) {
    if (e.code === 'INVALID_CREDENTIALS') return res.status(401).json({ error: e.message });
    res.status(500).json({ error: e.message || 'Error al iniciar sesión' });
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token no enviado' });
    const result = await authService.refresh(token);
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'INVALID_REFRESH' || e.code === 'USER_NOT_FOUND') return res.status(401).json({ error: e.message });
    res.status(500).json({ error: e.message || 'Error al refrescar' });
  }
}

export async function logout(req, res) {
  const clearOpts = { httpOnly: true, path: '/' };
  if (isCrossOrigin) {
    clearOpts.secure = true;
    clearOpts.sameSite = 'none';
  }
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
  res.json({ ok: true });
}

export async function me(req, res) {
  try {
    const user = authService.getMe(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error' });
  }
}
