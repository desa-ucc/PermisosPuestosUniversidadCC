# Address SQL Injection Failures on Creation

## Issue
Upon submitting new items in `HardwareIdeal` and `HardwareAsignado`, SQL Server silently failed inserting via C# constraints. After logging the `try / catch` natively it became obvious that the user changed the creation SPs (`sp_CreateHardwareAsignado` and `sp_CreateHardwareIdeal`) to require BOTH `@TipoHardwareId` and `@TipoEquipo` simultaneously to satisfy NOT NULL configurations.

## Changes
- Addressed `EquiposController.cs` and `HardwareIdealController.cs` to supply both parameters to `ExecuteSqlRawAsync` sequentially ensuring SQL parameter bindings are not dropped.
- Altered Angular `HardwareComponent` and `HardwareIdealComponent` controllers `onSubmit()` routine to resolve the textual representations and send `.tipoEquipo = this.getTipoName(...)` mapping to the ID selected.
- Cleaned up pre-commit validation.

## Fix visibility logic for PC fields in Hardware Ideal

### Issue
The fields 'Procesador', 'Memoria RAM', 'Disco Duro', and 'Marca de PC' were always visible in the `HardwareIdealComponent` instead of being conditionally displayed based on the selected hardware type (Laptop, Desktop, Computadora).

### Changes
- Updated the `isPC` getter to include 'computadora' for both `HardwareComponent` and `HardwareIdealComponent`.
- Wrapped 'Procesador', 'Memoria RAM', and 'Marca de PC' fields in the `HardwareIdealComponent` HTML template with `@if(isPC)` control flow to correctly toggle their visibility.
- Updated `onTipoHardwareChange` in `HardwareIdealComponent` to explicitly null out hidden fields when `isPC` is false, removing the `!isEditing` condition to prevent hidden invalid states or backend SQL constraint violations.

## Update Hardware Ideal UI and Data Presentation

### Issue
When specific components like Processor or Memory were hidden, the form layout appeared 'broken' due to fixed CSS Grid sizes. In the table, empty attributes were completely blank, making the presentation appear missing or incomplete.

### Changes
- Changed form grid layouts to `flex flex-wrap gap-4` and appended `flex-1 min-w-[250px]` with transition-all wrappers for form child `<div class="flex flex-col">` layouts to dynamically scale spacing natively without breaking.
- Appended `|| 'N/A'` fallbacks in Hardware Ideal components Table loop display.
- Matched Flex properties to `hardware.component.ts`.

## Fix Seguridad roles not loading

### Issue
The user noted that the Roles table is empty despite backend having records. The `SeguridadComponent` initializes properly with `ngOnInit` loading `this.cargarRoles()`, however the API endpoint `/api/seguridad/roles` throws a 500 server error silently to the console. This happens because the `SeguridadController` used raw string interpolation for `@Accion` instead of explicit SqlParameters which breaks EF Core strict configurations as required by memory.
Additionally, when switching tabs using `setTab`, the system did not automatically fetch data if not loaded.

### Changes
- Fixed `GetRoles` and `GetUsuarios` inside `SeguridadController.cs` to correctly instantiate `new SqlParameter("@Accion", "SELECT")`.
- Implemented data reloading logic in `setTab` natively inside `seguridad.component.ts`.

## Implement Security Roles tab functionality

### Issue
The user requested the full implementation of the 'Roles' tab in the Security module. The SP `sp_GestionarRoles` was already provided, but the backend controller, frontend service, component logic, and HTML template were missing or incomplete. The table was empty and non-functional.

### Changes
- Backend: Rewrote `SeguridadController` to include robust try-catch blocks and explicit `SqlParameter` handling with `@Accion` for `sp_GestionarRoles` integration.
- Frontend Service: Merged `seguridad.service.ts` into `permission.service.ts` to centralize all security endpoints and implemented `loadRoles()` method.
- Frontend Component: Refactored `seguridad.component.ts` to consume `PermissionService`, populate roles properly and auto-refresh the list after changes.
- Frontend HTML: Rebuilt the Roles table in `seguridad.component.html` adhering to the standard UI filter pattern.
- Cleanup: Removed redundant `seguridad.service.ts` file.

## Implement Angular AuthInterceptor for JWT handling

### Issue
The user experienced 401 Unauthorized errors in the frontend (`/api/seguridad/usuarios`) when accessing endpoints protected by `[Authorize]` in the .NET backend. The frontend was missing an HTTP interceptor to automatically attach the JWT token stored in `localStorage` to outgoing requests.

### Changes
- Created an Angular functional interceptor `auth.interceptor.ts`.
- The interceptor extracts the `token` from `localStorage` and appends it to the HTTP headers as `Authorization: Bearer <token>`.
- Included a `catchError` handler: If the backend returns a 401 status (e.g., token expired or invalid), the interceptor automatically clears the `localStorage` session variables (`token`, `role`, `permisos`) and redirects the user to the `/login` route using the `Router`.
- Registered the `authInterceptor` globally in `app.config.ts` by appending `withInterceptors([authInterceptor])` to the `provideHttpClient()` function.

## Implement Security Matrix tab functionality

### Issue
The user requested the full implementation of the 'Matriz de Permisos' tab in the Security module to bulk update permissions. The previous implementation triggered a database call individually for each checkbox change which wasn't efficient or user-friendly.

### Changes
- Updated Database SP `sp_GestionarPermisos` by creating `update_sp_permisos.sql` adding `@Accion='BULK_UPDATE'` and parsing `@JsonData` using `OPENJSON` and `MERGE` to perform mass update/inserts efficiently in one transaction.
- Temporary C# DB Patch: Included a temporary endpoint `[HttpGet("patch-db")]` in `SeguridadController` to apply the SP modification using `ExecuteSqlRawAsync` and removed it.
- Backend: Updated `SeguridadController`'s `GuardarPermisos` POST method to serialize the list of objects into JSON strings and pass it using `SqlParameter` resolving the user's bulk request efficiently.
- Frontend Component: Refactored `seguridad.component.ts` adding a boolean tracking unsaved states `hasUnsavedChanges`, modifying `marcarComoModificado()` to detect when the user edits matrices without triggering api calls.
- Frontend HTML: Rebuilt the Permisos table block in `seguridad.component.html`. Swapped individual Api pushes `(change)="actualizarPermiso(permiso)"` per checkbox to track unsaved states instead `(change)="marcarComoModificado()"`. Inserted a new 'Guardar Cambios' button that correctly pushes the complete modified Array back to the Backend.

## Fix Backend SQL Parameter Mismatch for Permisos SP

### Issue
The user encountered a server crash calling the SP `sp_GestionarPermisos` returning the error `@RolId is not a parameter for procedure sp_GestionarPermisos`. The backend was explicitly mapping `@RolId` via inline strings, but the SP defined the parameter as `@RoleId`.

### Changes
- Corrected the inline string mappings to map sequentially rather than individually named assignments, satisfying EF Core `FromSqlRaw` syntax requirements.
- Changed the mapped `SqlParameter` objects in `SeguridadController` to explicitly use `@RoleId` to match the exact definition of `sp_GestionarPermisos`.
- Handled the `DBNull.Value` assignment requirement when casting optional parameters mapping in the C# payload.
