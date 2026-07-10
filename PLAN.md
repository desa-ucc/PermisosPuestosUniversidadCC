# Seguridad y Accesos Module - Fase 1

## Architecture & State
- Added `Rol`, `Usuario`, and `Permiso` models mapping strictly to `pt_Roles`, `pt_Usuarios`, `pt_Permisos`.
- Added corresponding `DbSet` objects to `AppDbContext`.
- Created `SeguridadController` to serve Role, User, and Permission REST APIs (GET, POST, PUT, DELETE as appropriate).
- Ensured all CRUD operations on Roles, Users, and Permissions route through stored procedures (`sp_GestionarRoles`, `sp_GestionarUsuarios`, `sp_GestionarPermisos`) using EF Core's `FromSqlRaw` and `ExecuteSqlRawAsync` per the rules.

## Steps Executed
1. Models added to `PermisosPuestosApi/Models/Models.cs`
2. DbSets added to `PermisosPuestosApi/Data/AppDbContext.cs`
3. Controller created at `PermisosPuestosApi/Controllers/SeguridadController.cs`
4. Backend tested via `dotnet build`. No tests existed but ran `dotnet test`.

## Audit
- Code adheres to database constraints.
- Compilation is successful.
- "The House Way" documented via this PLAN.md
