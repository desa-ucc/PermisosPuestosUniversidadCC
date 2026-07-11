# Seguridad y Accesos Module - Fase 3 (Bugfix Carga de Datos y DBNull)

## Architecture & State
- Handled edge case in `SeguridadController.cs` where creating a user with an empty password hash would cause a crash due to ADO.NET failing to infer the type of a raw `null`. Replaced it with `DBNull.Value`.

## Steps Executed
1. Read existing Controller logic.
2. Appended coalescing operator (`?? (object)DBNull.Value`) to the `SqlParameter` handling `PasswordHash` during `CreateUsuario`.
3. Verified compilation with `dotnet build`.

## Audit
- Code adheres to database constraints using exact parameter names and safely passes null types.
- Backend/Frontend builds passed.
- RBAC UI restrictions applied safely on client actions.
- "The House Way" documented via this PLAN.md
