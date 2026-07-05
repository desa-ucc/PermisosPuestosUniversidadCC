1. **Create/Update `SeguridadController`**:
   - Create `PermisosPuestosApi/Controllers/SeguridadController.cs`.
   - Add endpoints: `mis-permisos`, `roles`, `usuarios`, `roles/{id}/permisos`, and `roles/{id}/permisos` (POST).
   - Ensure all endpoints use EF Core `FromSqlRaw` or `ExecuteSqlRaw` to call Stored Procedures (`sp_GestionarRoles`, `sp_GestionarUsuarios`, `sp_ObtenerPermisosPorRol`, `sp_GestionarPermisos`).

2. **Update Database Stored Procedures and Models**:
   - `sp_Login`: Add `RolId` to the `UsuarioDto` and JWT token so that `mis-permisos` can query permissions efficiently.
   - `sp_GestionarRoles`: Add this SP if it's missing (to read roles).
   - Update `UsuarioDto` in `PermisosPuestosApi/Models/Models.cs` to include `RolId` and `Permiso` models.

3. **Update Angular `PermissionService` (`src/src/app/services/permission.service.ts`)**:
   - Adjust to handle user data correctly if needed.

4. **Update `app.component.html` & `app.component.ts`**:
   - Dynamically render sidebar items based on `permissionService.tienePermiso(...)`.
   - Screens: `DASHBOARD`, `PUESTOS`, `COLABORADORES`, `HARDWARE_IDEAL`, `HARDWARE`, `SOFTWARE`, `SITIOS`, `PLATAFORMAS`, `REPORTES`, `SEGURIDAD`.
   - Remove static routes.

5. **Update `SeguridadComponent`**:
   - Unify Users and Roles management into tabs.
   - Implement "Users Tab" (CRUD for users, assigning roles).
   - Implement "Roles/Permissions Tab" (editing permissions matrix).
   - Use standard Toolbar with filter for Users and Roles tables.
   - Self-validation: Disable save buttons if `!permissionService.tienePermiso('SEGURIDAD', 'EDITAR')`.
   - Create proper DTOs in frontend.

6. **Pre-commit Checks**:
   - Run API build.
   - Run UI build.
   - Run tests if applicable.
