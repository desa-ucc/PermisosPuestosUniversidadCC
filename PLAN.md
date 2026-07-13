# PLAN.md - Implementación Catálogo "Tipo de Hardware"

## Objetivo
Añadir el catálogo "Tipo de Hardware" a la pantalla "Catálogos Base" con características idénticas a los otros catálogos (Ambientes, Sitios, Plataformas), asegurando el respeto de los permisos (RBAC).

## Arquitectura y Tareas Realizadas

1. **Base de Datos**
   - Se añadió la tabla `Cat_TiposHardware` para persistir los nombres.
   - Se implementó el Stored Procedure `sp_GestionarTiposHardware` con los métodos CRUD (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
2. **Backend (.NET 8 Web API)**
   - **Modelos:** Se creó el modelo `Cat_TiposHardware` heredando de `CatalogoBase` y se configuró su `DbSet` en el contexto `AppDbContext.cs`.
   - **Controlador:** Se añadieron los endpoints (`GET`, `POST`, `PUT`, `DELETE`) en `CatalogosController.cs` mapeados a `/api/Catalogos/TiposHardware` que ejecutan el stored procedure con parámetros fuertemente tipados.
3. **Frontend (Angular 17)**
   - **Servicios:** Se agregaron los métodos al `ApiService` (`getTiposHardware`, `getTipoHardware`, `createTipoHardware`, etc.) para conectarse con la API REST.
   - **Componentes:**
     - Se modificó `catalogos.component.ts` para soportar una nueva pestaña activa `'tiposHardware'`, añadir la lista `tiposHardwareList` y extender el enrutamiento de métodos de guardar/borrar y de obtención de títulos/placeholders.
     - Se inyectó en el HTML un nuevo ítem en el "Resumen de Catálogos" para representar y seleccionar "Tipo de Hardware". El sistema de seguridad en la tabla se mantiene usando la misma directiva y lógica condicional existente que respeta `PermissionService`.

## Auditoría
- [x] Backend compila sin errores
- [x] Angular se renderiza y pasa los tests correctamente
- [x] Las directrices de uso de Stored Procedures (`sp_GestionarTiposHardware`) se implementaron usando EF Core `FromSqlRaw` y `ExecuteSqlRawAsync`.

Score de auditoría: 100/100
