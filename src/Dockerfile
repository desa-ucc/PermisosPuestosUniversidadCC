# ==============================================================================
# ETAPA 1: CLONADOR / PREPARACIÓN DE CÓDIGO
# ==============================================================================
# Propósito: Preparar los archivos del frontend excluyendo basura
FROM node:20-alpine AS preparer
WORKDIR /source
COPY package*.json ./
COPY . .
# ARG GIT_TOKEN
# RUN if [ -n "$GIT_TOKEN" ]; then git clone ...; rm -rf .git; fi

# ==============================================================================
# ETAPA 2: BUILD / COMPILACIÓN DE ANGULAR
# ==============================================================================
# Propósito: Instalar dependencias y generar la versión de producción (dist)
FROM node:20-alpine AS build
WORKDIR /app
# Copiamos archivos de dependencias
COPY --from=preparer /source/package*.json ./
# Instalamos dependencias usando legacy-peer-deps según el Dockerfile original
RUN npm install --legacy-peer-deps
# Copiamos el resto del código
COPY --from=preparer /source/ ./
# Compilamos la aplicación de Angular
RUN npm run build --configuration=production

# ==============================================================================
# ETAPA 3: RUNTIME (NGINX)
# ==============================================================================
# Propósito: Servir los archivos estáticos usando Nginx con seguridad y optimización
FROM nginx:alpine AS final

# --- CONFIGURACIÓN DE ZONA HORARIA Y DEPENDENCIAS ---
ENV TZ=America/Costa_Rica
# Instalamos tzdata, gettext (para envsubst) y bash (para healthchecks)
# Removemos curl, wget y ping para Zero Trust.
RUN apk update && \
    apk add --no-cache tzdata gettext bash && \
    apk del curl wget ping || true && \
    rm -rf /var/cache/apk/*

# --- CONFIGURACIÓN DE SEGURIDAD (USUARIO NO-ROOT) ---
# Nginx corre como root por defecto. Modificamos para usar un usuario no privilegiado (appuser)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# --- CONFIGURACIÓN DEL SERVIDOR WEB ---
# Copiamos los archivos compilados del frontend desde la etapa de build
# Asumimos que el dist output está en /app/dist/src/browser (según el original)
COPY --from=build /app/dist/src/browser /usr/share/nginx/html
# Copiamos la configuración de Nginx (asegurarnos que el puerto y root estén bien)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el script de entrypoint para la inyección de variables de entorno
COPY entrypoint.sh /docker-entrypoint.d/99-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/99-entrypoint.sh && chmod +x /docker-entrypoint.d/99-entrypoint.sh

# Ajustamos permisos de los directorios clave de Nginx para el usuario no-root
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Exponemos el puerto 80 (aunque podemos mapearlo luego)
EXPOSE 80

# Cambiamos al usuario no-root
USER appuser

# Entrypoint default de nginx-alpine procesará los scripts en /docker-entrypoint.d/
# CMD final lanza Nginx de forma segura
CMD ["nginx", "-g", "daemon off;"]
