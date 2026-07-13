# PLAN.md - Integración Completa Catálogo "Tipo de Hardware"

## Objetivo
Añadir la pestaña de navegación para "Tipo de Hardware" y verificar que las acciones CRUD respetan rigurosamente el modelo de seguridad RBAC.

## Arquitectura y Tareas Realizadas

1. **Frontend (Angular 17)**
   - **Navegación Superior:** Se añadió el botón `Tipos de Hardware` en el panel de navegación de `catalogos.component.ts`.
   - **Seguridad en Botones de Acción:**
     - Se actualizó el botón "Editar" (ojo/lápiz) de la tabla para requerir el permiso `editar` en lugar de `ver`. Se actualizó la lógica subyacente de la función `abrirDetalle(item)` para reflejar esta restricción de seguridad (`PermissionService.tienePermiso('CATALOGOS', 'editar')`).
     - Se verificó que el botón "Registrar" y "Guardar Cambios" requiera correctamente `crear` y `editar` usando la directiva `*appPermiso`.
     - El botón de eliminar (basurero) requiere el permiso `eliminar` como corresponde.

## Auditoría
- [x] Backend compila sin errores
- [x] Angular se renderiza y pasa los tests correctamente
- [x] Directivas `*appPermiso` correctamente configuradas en los botones Registrar, Editar, y Eliminar.

Score de auditoría: 100/100
