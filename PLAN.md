# Plan: Complete User Loading Feature

## Architecture Changes
- **Backend (.NET 8):**
  - Updated `UsuarioDto` to include `Email` and `Activo` columns mapping explicitly required by `sp_GestionarUsuarios @Accion = 'SELECT'`.
  - Hardened `SeguridadController.GetUsuarios()` to execute the stored procedure using `SqlParameter` and added proper error boundaries via `try-catch` block returning an explicit 500 status message on exception.

- **Frontend (Angular 17):**
  - Updated `PermissionService` adding the strong-typed `Usuario` interface definition and returning an `Observable<Usuario[]>`.
  - Refactored `SeguridadComponent.cargarUsuarios()` replacing un-typed object assignments with strongly-typed arrays. Replaced deprecated `.subscribe()` signature.
  - The UI logic efficiently uses Angular template `@for` control flow block iteration displaying accurate properties.

## Completion Details
- Confirmed C# code correctly passes EF Core compile validations.
- Verified TypeScript passes compilation and test coverage headless validations correctly executing without errors.

## Roles Feature Architecture Changes
- **Backend (.NET 8):**
  - Updated `SeguridadController.cs` explicitly managing exceptions handling with robust `try-catch` blocks and specific parameter injections covering `.ExecuteSqlRawAsync` explicitly using `SqlParameter` objects across CRUD methods ensuring strictly handled null descriptions via `DBNull.Value`.
- **Frontend (Angular 17):**
  - Implemented strictly-typed `Rol` within `PermissionService`, refactored component loading ensuring `Observables<Rol[]>` casted directly against local definitions.
  - Refactored `seguridad.component.ts` updating dependencies routing all functions to map cleanly correctly calling data upon page init without empty template views.
