# ==============================================================================
# ETAPA 1: CLONADOR / PREPARACIÓN DE CÓDIGO
# ==============================================================================
# Propósito: Preparar los archivos del frontend excluyendo basura (multi-stage)
FROM node:20-alpine AS preparer
WORKDIR /source
COPY package*.json ./
COPY . .

# ==============================================================================
# ETAPA 2: BUILD / COMPILACIÓN DE ANGULAR
# ==============================================================================
# Propósito: Instalar dependencias y generar la versión de producción (dist)
FROM node:20-alpine AS build
WORKDIR /app
# Copiamos archivos de dependencias desde la etapa preparer
COPY --from=preparer /source/package*.json ./
# Instalamos dependencias (agrupado en un solo RUN y limpiando cache)
RUN npm install --legacy-peer-deps && npm cache clean --force
# Copiamos el resto del código
COPY --from=preparer /source/ ./
# Compilamos la aplicación de Angular
RUN npm run build --configuration=production

# ==============================================================================
# ETAPA 3: RUNTIME (NGINX)
# ==============================================================================
# Propósito: Servir los archivos estáticos usando Nginx (imagen alpine ultraligera)
FROM nginx:alpine AS final

# --- CONFIGURACIÓN DE ZONA HORARIA Y DEPENDENCIAS ---
# Establecemos la zona horaria a Costa Rica
ENV TZ=America/Costa_Rica
# Instalamos dependencias estrictamente necesarias
USER root
# (Alpine in docker inside docker inside podman inside whatever has bug with apk on this env, we will skip for now)
# RUN apk add --no-cache tzdata gettext bash

# --- CONFIGURACIÓN DE SEGURIDAD (USUARIO NO-ROOT) ---
# Nginx corre como root por defecto. Modificamos para usar un usuario no privilegiado (appuser)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# --- CONFIGURACIÓN DEL SERVIDOR WEB ---
# Copiamos los archivos compilados del frontend desde la etapa de build
COPY --from=build /app/dist/src/browser /usr/share/nginx/html
# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- INYECCIÓN DE VARIABLES DE ENTORNO ---
# Copiamos el script de entrypoint. Nginx-alpine ejecuta todo lo que esté en /docker-entrypoint.d/
COPY entrypoint.sh /docker-entrypoint.d/99-entrypoint.sh
# Arreglamos posibles problemas de finales de línea en Windows (CRLF a LF) y damos permisos de ejecución
RUN sed -i 's/\r$//' /docker-entrypoint.d/99-entrypoint.sh && chmod +x /docker-entrypoint.d/99-entrypoint.sh

# --- AJUSTE DE PERMISOS PARA USUARIO NO-ROOT ---
# El usuario appuser debe poder leer/escribir en las carpetas necesarias de Nginx
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Exponemos el puerto 80 (el cual será consumido por Docker)
EXPOSE 80

# Cambiamos al usuario no-root por principio de mínimo privilegio
USER appuser

# El entrypoint de la imagen oficial de nginx ya llama a los scripts en /docker-entrypoint.d/
# Iniciamos Nginx de forma segura
CMD ["nginx", "-g", "daemon off;"]
