# Desplegar StockFlow en Vercel (portafolio)

Para que el proyecto funcione en producción necesitas **dos despliegues**: el **frontend** en Vercel y el **backend** en Railway (gratis). Luego conectas ambos con variables de entorno.

---

## 1. Subir el código a GitHub

Si aún no tienes el repo en GitHub:

```bash
cd c:\Users\steve\OneDrive\Escritorio\SaaS
git init
git add .
git commit -m "StockFlow - SaaS inventarios"
```

Crea un repositorio nuevo en GitHub y enlázalo:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Desplegar el backend en Railway

El backend incluye un **Dockerfile**. Railway lo detecta y usa Docker para construir y ejecutar (así se evita el error de Railpack).

1. Entra en [railway.app](https://railway.app) e inicia sesión (con GitHub).
2. **New Project** → **Deploy from GitHub repo** → elige tu repositorio.
3. En **Settings** del servicio:
   - **Root Directory:** `backend` (obligatorio)
   - No hace falta poner Build Command ni Start Command; el Dockerfile ya lo define.

4. **Variables** (pestaña Variables):
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = **la URL de tu frontend en Vercel** (la tendrás después del paso 3). Ejemplo: `https://stockflow-tu-usuario.vercel.app`
   - Las demás (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, etc.) puedes dejarlas o generarlas.

5. **Deploy.** Cuando termine, Railway te da una URL pública, por ejemplo:
   `https://tu-proyecto.up.railway.app`  
   **Cópiala** — la usarás en el frontend.

6. (Opcional) En Railway, en **Settings** → **Networking** → **Generate Domain** si no te asignó dominio automático.

---

## 3. Desplegar el frontend en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con GitHub).
2. **Add New** → **Project** → importa el mismo repositorio de GitHub.
3. **No cambies el Root Directory** — déjalo vacío (raíz del repo). El `vercel.json` en la raíz ya indica cómo construir y servir el frontend.
4. **Environment Variables** (antes de desplegar):
   - Nombre: `VITE_API_URL`  
   - Valor: **la URL del backend en Railway** (sin barra final). Ejemplo: `https://tu-proyecto.up.railway.app`
5. **Deploy.** Vercel te dará una URL como `https://tu-proyecto.vercel.app`.

---

## 4. Conectar frontend y backend

1. **Vercel:** Ya tienes `VITE_API_URL` apuntando al backend. No hace falta cambiar nada más.
2. **Railway:** Vuelve a **Variables** del backend y pon:
   - `CLIENT_URL` = `https://tu-proyecto.vercel.app` (la URL real de tu proyecto en Vercel).
3. Guarda y deja que Railway vuelva a desplegar si hace falta.

Con esto, el frontend en Vercel llamará al API en Railway y las cookies de autenticación funcionarán entre dominios.

---

## 5. Verificar

- Abre la URL de Vercel.
- Regístrate o inicia sesión.
- Prueba inventario y órdenes.

Si algo falla, revisa:

- Que `VITE_API_URL` en Vercel sea exactamente la URL del backend (sin `/` al final).
- Que `CLIENT_URL` en Railway sea exactamente la URL del frontend en Vercel (con `https://`).
- Que en Railway el **Root Directory** sea `backend` y el comando de inicio sea `node src/server.js` o `npm start`.

---

## Enlaces rápidos

| Dónde   | Qué poner |
|--------|------------|
| Vercel | `VITE_API_URL` = URL del backend (Railway) |
| Railway | `CLIENT_URL` = URL del frontend (Vercel) |
| Railway | `NODE_ENV` = `production` |

Cuando tengas las dos URLs, puedes añadir el enlace de Vercel a tu portafolio.
