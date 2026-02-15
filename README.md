# StockFlow — SaaS de Gestión de Inventarios (Portafolio)

Sistema de gestión de inventarios multiusuario con roles (Admin / Empleado), órdenes con expiración automática, dashboard con métricas y subida de imágenes. Pensado para portafolio: **los datos se guardan en memoria en el servidor** (no hay base de datos real) y se pierden al reiniciar.

## Stack

- **Frontend:** React + Vite + MUI (Material UI)
- **Backend:** Node.js + Express
- **Auth:** JWT + Refresh Tokens (cookies httpOnly)
- **Almacenamiento:** Memoria (repositories en memoria, sin MySQL)

## Estructura del backend

- `routes` → `controllers` → `services` → `repositories`
- Repositorios usan un store en memoria (`repositories/store.js`)

## Cómo ejecutar

### Backend

```bash
cd backend
cp .env.example .env   # opcional: editar .env si quieres cambiar puerto o secrets
npm install
npm run dev
```

API en `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App en `http://localhost:5173`. El proxy de Vite redirige `/api` y `/uploads` al backend.

## Usuarios y roles

- Regístrate en **Registrarse** y elige rol **Admin** o **Empleado**.
- **Admin:** puede crear/editar/eliminar productos en Inventario y cambiar estado de órdenes.
- **Empleado:** puede ver inventario y crear/ver órdenes.

## Deploy (Vercel + Railway)

Para tener el proyecto visible en tu portafolio:

1. **Frontend en Vercel** (el que verá la gente).
2. **Backend en Railway** (gratis; la API y los datos en memoria).

Guía paso a paso: **[DEPLOY.md](./DEPLOY.md)**.
# Saas
