# ============================================================
# Dockerfile — FrontendTallerNarbus / ProtoNeumaticos
# Build multi-stage: Node 22 (build) → Nginx 1.27 (serve)
#
# USO EN PRODUCCIÓN:
#   docker build \
#     --build-arg VITE_API_BASE_URL=https://api.narbus.cl \
#     -t narbus-frontend:latest .
#
# La URL del backend NUNCA va hardcodeada aquí.
# Pásala como secreto desde GitHub Actions / GitLab CI.
# ============================================================

# ── Stage 1: Build ─────────────────────────────────────────
FROM node:22-alpine AS builder

# Variables de entorno de build (inyectadas por CI/CD como secretos)
ARG VITE_API_BASE_URL
ARG VITE_API_URL

# Validar que se pasó al menos una URL del backend
RUN test -n "$VITE_API_BASE_URL" || test -n "$VITE_API_URL" || \
    (echo "ERROR: Debes pasar --build-arg VITE_API_BASE_URL=https://api.narbus.cl" && exit 1)

# Exponer como variables de entorno para que Vite las lea durante el build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copiar manifiestos de dependencias primero (aprovecha el caché de capas)
COPY package.json package-lock.json ./

# Instalar dependencias de producción + devDependencies (necesarios para el build)
RUN npm ci --ignore-scripts

# Copiar el código fuente (excluye lo definido en .dockerignore)
COPY . .

# Compilar TypeScript + Vite bundle de producción
RUN npm run build

# ── Stage 2: Serve ─────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remover la configuración default de nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/narbus.conf

# Copiar el build de Vite desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx expone el puerto 80
EXPOSE 80

# Healthcheck: verifica que nginx responde
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

# Iniciar nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
