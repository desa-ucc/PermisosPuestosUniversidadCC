# ==============================================================================
# ETAPA 1: CLONADOR (Descarga del código fuente)
# ==============================================================================
# Imagen Alpine ligera con Git para aislar el proceso de obtención de código.
FROM alpine/git AS clonador
# Variables ARG para permitir inyección de credenciales desde el entorno CI/CD.
ARG GIT_REPO=https://github.com/desa-ucc/PermisosPuestosUniversidadCC.git
ARG GIT_USER=none
ARG GIT_TOKEN=none

WORKDIR /src
# Se clona el código fuente usando los ARG suministrados y se elimina .git inmediatamente.
RUN git clone https://${GIT_USER}:${GIT_TOKEN}@${GIT_REPO#https://} . || git clone ${GIT_REPO} . \
    && rm -rf .git

# ==============================================================================
# ETAPA 2: COMPILADOR (Build de Angular)
# ==============================================================================
# Utilizamos Node.js v20 para la instalación de dependencias y compilación.
FROM node:20 AS build
WORKDIR /app
# Copiamos la carpeta src desde la etapa de clonación
COPY --from=clonador /src/src /app/

# Instalamos las dependencias y construimos el proyecto en un solo bloque.
RUN npm install --legacy-peer-deps && \
    npm run build --configuration=production

# ==============================================================================
# ETAPA 3: RUNTIME (Imagen final con Nginx)
# ==============================================================================
# Utilizamos nginx:alpine por ser la base más pequeña y segura.
FROM nginx:alpine AS final

# Configuramos la zona horaria a Costa Rica de forma consistente.
ENV TZ=America/Costa_Rica

# Ejecutamos las políticas de Zero Trust y mínimo privilegio:
# 1. Instalamos bash (para healthchecks) y tzdata.
# 2. Eliminamos herramientas de red (curl, wget).
# 3. Configuramos la zona horaria usando tzdata.
# 4. Ajustamos permisos de los directorios de Nginx para poder correr como no-root.
# 5. Limpiamos la caché de apk para reducir peso.
RUN apk update && \
    apk add --no-cache bash tzdata && \
    apk del curl wget && \
    cp /usr/share/zoneinfo/America/Costa_Rica /etc/localtime && \
    echo "America/Costa_Rica" > /etc/timezone && \
    chown -R nginx:nginx /usr/share/nginx/html /etc/nginx && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx && \
    rm -rf /var/cache/apk/*

# Copiamos los archivos estáticos generados por Angular.
COPY --from=build /app/dist/src/browser /usr/share/nginx/html
# Copiamos la configuración de Nginx (sobreescribe la base).
COPY --from=clonador /src/src/nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 8080 en lugar de 80, permitido para no-root sin privilegios adicionales.
EXPOSE 8080

# Cambiamos al usuario nginx (no-root).
USER nginx

# Comando de inicio de nginx asegurando que no se ejecute en segundo plano.
CMD ["nginx", "-g", "daemon off;"]
