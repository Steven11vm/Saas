# Dockerfile en la raíz: construye el backend cuando Railway no tiene Root Directory
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./
RUN mkdir -p uploads

EXPOSE 4000

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
