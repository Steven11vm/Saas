// En producción (Vercel), apuntar al backend desplegado (ej. Railway)
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

/** URL base para imágenes del backend (uploads). Usar: getUploadsUrl(item.imageUrl) */
export const getUploadsUrl = (path) => {
  if (!path) return null;
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path;
};

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 401 && path !== '/auth/refresh') {
    try {
      await request('/auth/refresh', { method: 'POST' });
      return request(path, options); // re-intentar la petición original
    } catch {
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Sesión expirada');
    }
  }
  const data = res.headers.get('content-type')?.includes('json') ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  auth: {
    me: () => request('/auth/me'),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refresh: () => request('/auth/refresh', { method: 'POST' }),
  },
  inventory: {
    list: () => request('/inventory'),
    get: (id) => request(`/inventory/${id}`),
    create: (body, file) => {
      if (file) {
        const form = new FormData();
        Object.entries(body).forEach(([k, v]) => form.append(k, v != null ? v : ''));
        form.append('image', file);
        return fetch(`${API_BASE}/inventory`, { method: 'POST', credentials: 'include', body: form }).then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(new Error(d.error)))));
      }
      return request('/inventory', { method: 'POST', body: JSON.stringify(body) });
    },
    update: (id, body, file) => {
      if (file) {
        const form = new FormData();
        Object.entries(body).forEach(([k, v]) => form.append(k, v != null ? v : ''));
        form.append('image', file);
        return fetch(`${API_BASE}/inventory/${id}`, { method: 'PUT', credentials: 'include', body: form }).then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(new Error(d.error)))));
      }
      return request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    delete: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    metrics: () => request('/orders/metrics'),
  },
};
