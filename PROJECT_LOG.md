## Mantenimiento de Catálogos (Completado)
- **Componente:** Tipo de Hardware ('Catálogos Base')
- **Estado:** Implementado con acciones CRUD (Crear, Editar, Eliminar lógicamente)
- **Seguridad:** Todas las acciones están protegidas mediante RBAC utilizando la directiva `*appPermiso` en Angular y el Stored Procedure `sp_GestionarTiposHardware` en el backend.
## Reporte Integral (Completado)
- **Componente:** Generación de Reportes Avanzados
- **Estado:** Se ajustaron los modelos de EF Core (ReporteBaseDto) y los Stored Procedures para incluir una "Sección 0" base, y filtrar resultados null/vacíos con INNER JOIN.
- **UI:** La tabla HTML y exportación en Angular ahora son estrictamente condicionales utilizando lógica `@if (data.seccion.length > 0)`.

## Docker Infrastructure Refactoring

- Refactored `PermisosPuestosApi/Dockerfile` using multi-stage builds, Alpine slim, zero-trust (removed curl/wget/ping), specific TZ `America/Costa_Rica`, and non-root `appuser`.
- Refactored `src/Dockerfile` using multi-stage builds, Alpine Nginx, non-root `appuser`, and configured it for runtime environment variable injection using `entrypoint.sh` with `envsubst`.
- Implemented runtime environment variable injection for Angular via `window.__env` replacing hardcoded variables in `environment.ts` and `index.html`.
- Updated `docker-compose.yml` to rely entirely on `.env` file, explicit isolated network `app_network`, custom container names, internal service resolution, explicit `depends_on: condition: service_healthy`, and Bash native healthchecks.

## Integración Catálogos Tipos de Licencia y Nombres de Plataformas

- Se refactorizó `CatalogosController.cs` reconstruyéndolo por completo, asegurando cierres de llaves válidos y sin errores CS1513 ni CS0106.
- Se implementaron los endpoints GET, POST, PUT y DELETE para `TiposLicencia` (usando `sp_GestionarTiposLicencia` y `v_GestionarTiposLicencia`) y `PlataformasNombres` (usando `sp_GestionarPlataformasNombres` y `v_GestionarPlataformasNombres`).
- Se validaron que todos los parámetros al SP utilicen instancias C# de `SqlParameter` con inyección segura de DBNull.Value.
- Se añadieron las vistas (tabs) de TiposLicencia y PlataformasNombres al HTML de `catalogos.component.ts`.
- Se corrigieron duplicidades en las implementaciones de endpoints en `api.service.ts` para evitar fallos de Angular AOT.
- Se confirmó que `plataformas.component.ts` ya consume los catálogos correspondientes para reemplazar los valores estáticos.
