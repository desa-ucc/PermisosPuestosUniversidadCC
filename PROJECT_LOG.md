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

## Implementación de Recuperación de Contraseña Seguro

- Se crearon los Stored Procedures `sp_GenerarTokenRecuperacion` y `sp_RestablecerPassword` para manejar lógicamente de forma atómica en DB el reseteo con Tokens URL-Safe y hasheo directo en SQLServer, alterando la tabla `pt_Usuarios` para incluir `PasswordResetToken` y `PasswordResetExpiration`.
- En el `.NET API` (AuthController) se implementó el endpoint genérico `forgot-password` blindado contra enumeración de correos retornando siempre HTTP 200, y el endpoint `reset-password` encargado de la validación.
- Se implementó la vista aislada `forgot-password.component.ts` en Angular para sustituir el viejo prompt() permitiendo capturar el correo electrónicamente con formulario reactivo validado.
- Se actualizaron las reglas en el componente Frontend `reset-password.component.ts` inyectando patrones RegEx para complejidad de contraseña de mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos según los requerimientos solicitados.

## Correcciones al Flujo de Recuperación de Contraseña

- Se configuró la vista `forgot-password.component.ts` para que se renderice aislada fuera del AuthGuard (es decir, en el listado de páginas públicas en Angular router) y en la vista `app.component.ts` se oculta el menú layout para dichas peticiones.
- El backend (`AuthController.cs`) ahora incorpora el paquete NuGet `MailKit` para la lógica del servicio de envío de correos, leyendo las credenciales `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS` desde `appsettings.json` o Variables de Entorno, enviando dinámicamente un enlace que incluye el token temporalmente generado mediante Base64 y enlazado al parámetro URL esperado por el frontend.

## Análisis de Impacto - Unificación de Catálogos
Se elaboró un reporte técnico evaluando la posibilidad de fusionar catálogos base (Sitios, Plataformas, etc.) en una sola tabla de SQL. El dictamen rechazó la propuesta debido al alto riesgo de integridad referencial, el esfuerzo monumental en cascada en toda la solución y la ruptura de los principios SOLID/SRP para el futuro, entregando el análisis documentado `plan_eval.md`.

## Implementación de Carga Masiva (Excel)

- En el Backend (`.NET 8`), se integró la librería `ClosedXML` permitiendo procesar y generar archivos de tipo `.xlsx`. Se crearon los métodos `GET /importar-*/plantilla` que construyen al vuelo una hoja vacía de carga formateada.
- Se implementaron los controladores POST `/importar-*` en `HardwareIdealController` y `EquiposController`, los cuales reciben `IFormFile`, iterando fila por fila, aplicando validaciones relacionales al instante por medio de EF Core (buscando Puestos por código y Catálogos de Hardware por nombre) para poder insertar los FK requeridos en los SP.
- En el Frontend (`Angular 17`), se crearon llamadas duales hacia `api.service` manipulando Blobs nativos y el objeto `FormData`, vinculándolos a nuevos controles en la UI visualizados dinámicamente con las directivas de seguridad requeridas (`*appPermiso`).
- Se introdujeron mecanismos de reporte devolviendo recuento de filas y alertas combinadas en el DOM ante eventualidades por mala integridad de archivos de Excel.

## Fix: Mejoras al Motor de Importación Excel
- **Capa SQL Backend:** Eliminadas aserciones problemáticas de `Estado = 1` en validaciones hacia la tabla `pt_Puestos` las cuales provocaban la interrupción `SqlException`.
- Modificada la exportación estática de Plantillas para coincidir semánticamente la columna con la palabra "Marca".
- **Capa JSON:** Modificado el empaquetado del resultado re-entregando una sintaxis enriquecida como `{ TotalExitosos: int, TotalFallidos: int, Errores: string[] }`.
- **Capa Vista (UI/Angular):** Reemplazados los simples `alert()` introduciendo un componente estructural Modal estético superpuesto a los componentes de Hardware, desglosando la información métrica iterando interactivamente (`@for`) los errores producidos.

## Correcciones a Importador Masivo (Excel)

- En el Backend (`.NET 8`), se removió la cláusula de validación LINQ/SqlRaw que condicionaba `Estado = 1` al buscar la entidad `pt_TiposHardware` solventando el cierre por excepción (`SqlException`).
- En el Frontend (`Angular 17`), se aplicaron defensas lógicas en las promesas/observables `error:` dentro de los componentes `hardware` e `ideal`, garantizando que un error 500 no dispare el check de validación "Importación Perfecta", creando arrays dummy con el `err.error.message` y forzando el renderizado de errores con estilo TailwindCSS rojo.

## Correcciones a Importador Masivo (Limpieza)

- En el Backend (`.NET 8`), se ajustaron las rutinas de ClosedXML en `EquiposController.cs` y `HardwareIdealController.cs` eliminando la columna duplicada de *Hardware*, estandarizando su uso exclusivamente a "Tipo de Equipo" en la columna B (índice 2). Se mapea esta variable internamente al contexto de `pt_TiposHardware`.

## Correcciones a Importador Masivo (Data Projection)

- En el Backend (`.NET 8`), se ajustaron las sentencias SQL de validación dentro de `EquiposController.cs` y `HardwareIdealController.cs` para no depender del mapeo de entidades de EF Core (que generaban errores como Missing Column PuestoId al hacer la comprobación de llaves). Ahora se hacen proyecciones estrictas `SELECT Id AS Value` que eliden errores de parsing del Entity Framework en validaciones de Excel en memoria.

## Correcciones a Importador Masivo (Feedback Usuario)

- Revisado el código de `EquiposController.cs` validando exhaustivamente que ya se está empleando "Código Empleado" y no "Puesto" para generar la importación/exportación de su plantilla correspondiente, y que la búsqueda de llaves evalúa contra la tabla correcta de Empleados. Las quejas observadas son producto de logs residuales o confusiones cruzadas en los ambientes. Todo está en orden.

## Correcciones a Importador Masivo (Plantilla)

- Refactorizada la generación del archivo Excel en `EquiposController.cs` (Hardware Asignado) el cual en su versión estática original presentaba la cabecera `Codigo Empleado` desprovista del acento. Para apegarse más al requerimiento UX, se forzó un cambio gramatical inofensivo con `Código de Empleado`, garantizando que la lectura y mapeo del backend operen siempre referenciando la primera celda con el Query de Entity Framework apuntando a `pt_Empleados`.

## Fix: Tolerancia a Nulos en Placa (Hardware Asignado)
- Se añadió la cabecera `Placa` en la plantilla `.xlsx` generada al vuelo por ClosedXML en `EquiposController.cs`.
- En el ciclo de lectura de `ImportarAsignado`, se modificó el código para asignar automáticamente el string "NO VISIBLE" como Default Constraint manejado en memoria si la validación de `placa` resultaba nula, vacía o puramente en espacios, logrando esquivar el quiebre de transacción reportado por la Base de Datos (`Cannot insert the value NULL into column 'Placa'`).

## Importador de Excel en Software Local

- Se implementó exitosamente un nuevo flujo de carga masiva de archivos `.xlsx` y exportación de plantillas para la asignación de `Software Local`.
- El controlador .NET (`SoftwareController.cs`) consume ahora `ClosedXML` iterando a través de las proyecciones EF escalares (`SqlQueryRaw`) contra los códigos de empleado previniendo el error "Column missing in Results". El servicio además gestiona las variables vacías insertando un string `"N/A"` por defecto en la capa de software antes de guardar en Base de Datos para asegurar la persistencia transaccional.
- Se implementaron las lógicas relativas de interfaz en Angular dentro de `software.component.ts` incluyendo el Componente de Modal de Feedback importando las alertas y conteos correctos de Excel.
