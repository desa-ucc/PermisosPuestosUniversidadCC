# ==============================================================================
# ETAPA 1: CLONADOR (Descarga de código base)
# ==============================================================================
FROM alpine/git AS clone
# Variables para descarga
ARG GIT_REPO
ARG GIT_USER
ARG GIT_TOKEN

WORKDIR /app
# Clonación condicional y eliminación obligatoria de .git
RUN if [ -n "$GIT_REPO" ] && [ -n "$GIT_TOKEN" ]; then \
        git clone https://${GIT_USER}:${GIT_TOKEN}@${GIT_REPO} . ; \
    fi && rm -rf .git

# ==============================================================================
# ETAPA 2: COMPILACIÓN (Build Frontend)
# ==============================================================================
# Usamos Node 20 en Alpine para un entorno de compilación ligero
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias para usar el caché de capas
COPY package*.json ./
# Instalamos dependencias usando npm ci o install según corresponda
RUN npm install --legacy-peer-deps

# Copiamos el resto de la aplicación (o lo clonado)
COPY . .
# Copiar del repo si se descargó
COPY --from=clone /app /app/repo_content
RUN cp -a /app/repo_content/. /app/ || true

# Compilamos la aplicación de Angular en modo producción
RUN npm run build --configuration=production

# ==============================================================================
# ETAPA 3: RUNTIME (Producción en Nginx, Zero Trust y Optimización de Capas)
# ==============================================================================
# Imagen de Nginx Alpine, ligera
FROM nginx:alpine

# Configurar Timezone
ENV TZ=America/Costa_Rica

# Agrupar comandos RUN para optimizar capas:
# 1. Configurar huso horario.
# 2. Instalar bash (para healthcheck).
# 3. Remover binarios de red inseguros.
# 4. Configurar el usuario no-root 'appuser'.
# 5. Modificar permisos de carpetas de Nginx para permitir ejecución rootless.
# 6. Limpiar caché apk.
RUN apk update && \
    apk add --no-cache tzdata bash && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del wget curl ping telnet || true && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid && \
    rm -rf /var/cache/apk/*

# Copiar los artefactos del frontend compilado
COPY --chown=appuser:appgroup --from=build /app/dist/src/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx (se ajustará a puerto 8080 luego)
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

# Aseguramos de que todo lo copiado pertenezca a appuser

# Cambiar a usuario sin privilegios
USER appuser

# Exponer el puerto para Nginx rootless
EXPOSE 8080

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
