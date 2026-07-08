# PLAN: Implementación de Seguridad y Acceso Dinámico (RBAC)

## Parte 1: Carga de Permisos Post-Login

### Flujo de Ejecución:
1. **Autenticación (Login):** El usuario ingresa credenciales en el `LoginComponent`.
2. **Validación:** El backend valida, genera un JWT (que contiene el `RolId`) y lo devuelve.
3. **Almacenamiento Local:** El frontend guarda el token en `localStorage`.
4. **Carga de Permisos (Post-Login):**
   - Tras el login exitoso y redirección (ej. en `app.component.ts` al detectar el evento de navegación o inicialización con token presente), se invoca `PermissionService.cargarPermisosDelUsuarioLogueado()`.
   - Este método realiza una petición HTTP (`/api/seguridad/mis-permisos`) que ejecuta el procedimiento almacenado (SP) para obtener la matriz de permisos basada en el `RolId`.
5. **Estado Global:** La matriz devuelta se guarda tanto en un `BehaviorSubject` (estado global en memoria reactivo) como en `localStorage` (para persistencia entre recargas).

### Procesamiento de Datos:
La matriz devuelta por el SP contiene objetos con esta estructura (mapeada a la interfaz `Permiso`):
```typescript
{
  roleId: number;
  pantallaId: string; // ej. 'PUESTOS', 'COLABORADORES'
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeVer: boolean;
}
```
El `PermissionService` almacena este array. La función principal de consulta es `tienePermiso(pantallaId, accion)`, la cual busca en el array global la configuración para esa pantalla y devuelve `true` o `false` para la acción solicitada.

## Parte 2: Construcción y Desarrollo (Frontend Dinámico)

### Menú Dinámico (Sidebar):
El menú lateral (`app.component.html`) utiliza la directiva `*ngIf` vinculada al método `tienePermiso` del `PermissionService`.
Solo se renderizarán los enlaces cuya evaluación de `permissionService.tienePermiso('PANTALLA_ID', 'VER')` sea `true`.

### Control de Acceso a Acciones (CRUD):
Para controlar acciones específicas dentro de los componentes:
- Se inyecta `PermissionService` en los componentes.
- En la plantilla HTML, se utilizan directivas `*ngIf` envolviendo los botones y elementos interactivos:
  - `*ngIf="permissionService.tienePermiso('PANTALLA_ID', 'CREAR')"` para el botón "Nuevo".
  - `*ngIf="permissionService.tienePermiso('PANTALLA_ID', 'EDITAR')"` para botones de "Editar" o "Guardar". (Y usando el patrón "Modo Consulta" o `form.disable()` si es false).
  - `*ngIf="permissionService.tienePermiso('PANTALLA_ID', 'ELIMINAR')"` para botones de "Eliminar".

### Seguridad en Rutas (RoleGuard):
Para proteger el acceso directo mediante la URL, se implementa un `RoleGuard` (`CanActivate`).
1. Este guardián intercepta la navegación.
2. Extrae el `pantallaId` de los datos de la ruta (`route.data['pantallaId']`).
3. Evalúa si el usuario tiene permiso utilizando `PermissionService.tienePermiso(pantallaId, 'VER')`.
4. Si devuelve `false`, redirige al usuario al `/dashboard` (o muestra una vista de acceso denegado). Si devuelve `true`, permite el paso.
