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
