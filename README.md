# Permisos Puestos Universidad CC - Docker Architecture

Este repositorio contiene la arquitectura refactorizada en Docker (The House Way) para la aplicación Permisos Puestos. Cumple con estrictas normas de seguridad (Zero Trust, ejecución rootless, eliminación de herramientas de red), optimización multicapa y una documentación exhaustiva.

## Requisitos Previos

- Docker
- Docker Compose

## Configuración del Entorno (.env)

Antes de levantar el proyecto, es obligatorio configurar las variables de entorno. Nunca se deben exponer credenciales en el código.

1. Duplica el archivo `.env.example` en la raíz del proyecto y renómbralo a `.env`.
   ```bash
   cp .env.example .env
   ```
2. Edita el archivo `.env` con tus configuraciones. A continuación una explicación de las variables necesarias:
   - `GIT_REPO`, `GIT_USER`, `GIT_TOKEN`: (Opcional) Variables usadas por los Dockerfiles para clonar el repositorio si no se va a montar localmente.
   - `DB_CONNECTION_STRING`: La cadena de conexión a la base de datos SQL Server (ej. `Server=172.29.99.8;Database=...`).
   - `JWT_SECRET_KEY`: La clave secreta para firmar los tokens JWT en la API.
   - `API_PORT` y `FRONTEND_PORT`: Los puertos mediante los que se accederá desde el host (por defecto 5000 y 4200 respectivamente).

## Construcción y Ejecución

Para construir y levantar todo el entorno, ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d --build
```

Esto hará que Docker:
1. Construya el contenedor `api` (usando un build multi-stage, rootless, sin herramientas de red).
2. Espere a que el `healthcheck` de bash de la API sea exitoso (`depends_on` con `condition: service_healthy`).
3. Construya e inicie el contenedor `frontend` (usando un Nginx Alpine, rootless en el puerto 8080 internamente).

## Instrucciones de Acceso

Una vez que los contenedores estén levantados y `healthchecks` pasados, puedes acceder a la aplicación en:

- **Frontend (UI Angular):** http://localhost:4200 (o el puerto configurado en `FRONTEND_PORT`).
- **Backend (API Swagger/Endpoints):** http://localhost:5000 (o el puerto configurado en `API_PORT`).

## Verificación de Funcionamiento

1. **Estado de contenedores:**
   ```bash
   docker compose ps
   ```
   Asegúrate de que ambos servicios (`api` y `frontend`) estén en estado "Up (healthy)".
2. **Revisión de Logs:**
   Si algo no funciona, revisa los logs de cada servicio:
   ```bash
   docker compose logs -f api
   docker compose logs -f frontend
   ```
3. **Comprobar API:** Ingresa a `http://localhost:5000/swagger` (si está habilitado en prod) o haz una petición a un endpoint público para verificar conectividad de BD.
4. **Comprobar Frontend:** Ingresa a `http://localhost:4200`. La pantalla de login debe cargar correctamente y el componente debe poder realizar llamadas al backend de forma saludable.
