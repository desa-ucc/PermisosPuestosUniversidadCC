# Plan de Refactorización de Infraestructura Docker

## Arquitectura y Objetivos
El objetivo principal de este plan es reestructurar los archivos de Docker (`Dockerfile` de backend y frontend) y `docker-compose.yml` para cumplir con estándares estrictos de seguridad, optimización y documentación.

## Pasos

1. **Refactorizar Backend Dockerfile (`PermisosPuestosApi/Dockerfile`)**
   - Implementar Multi-stage builds (Preparación, Build, Runtime).
   - Usar imagen base ligera en runtime (Alpine).
   - Configurar zona horaria (`America/Costa_Rica`).
   - Crear y usar usuario no-root (`appuser`).
   - Remover herramientas de red (`curl`, `wget`, etc.).
   - Agregar documentación exhaustiva en español.

2. **Refactorizar Frontend Dockerfile (`src/Dockerfile`)**
   - Implementar Multi-stage builds (Preparación, Build, Runtime).
   - Usar Nginx Alpine en runtime.
   - Configurar zona horaria (`America/Costa_Rica`).
   - Crear y usar usuario no-root (`appuser`) ajustando los permisos de Nginx.
   - Remover herramientas de red (`curl`, `wget`, etc.) e instalar dependencias necesarias (`tzdata`, `gettext` para `envsubst`, `bash`).
   - Agregar documentación exhaustiva en español.

3. **Crear script de inyección de variables (`src/entrypoint.sh`)**
   - Script Bash para tomar variables de entorno e inyectarlas en un archivo `env.js` dentro del build de Angular antes de iniciar Nginx.

4. **Refactorizar `docker-compose.yml`**
   - Mapear variables mediante archivo `.env`.
   - Definir red interna explícita.
   - Establecer `container_name`.
   - Implementar healthchecks usando `bash -c '</dev/tcp/127.0.0.1/puerto'`.
   - Configurar dependencias con `condition: service_healthy`.
   - Agregar comentarios descriptivos línea por línea en español.

5. **Completar pasos pre-commit**
   - Verificar que los archivos estén correctamente formados y documentados.
   - Completar las revisiones y reflexiones del pre-commit.
