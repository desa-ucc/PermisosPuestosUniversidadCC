## Mantenimiento de Catálogos (Completado)
- **Componente:** Tipo de Hardware ('Catálogos Base')
- **Estado:** Implementado con acciones CRUD (Crear, Editar, Eliminar lógicamente)
- **Seguridad:** Todas las acciones están protegidas mediante RBAC utilizando la directiva `*appPermiso` en Angular y el Stored Procedure `sp_GestionarTiposHardware` en el backend.
## Reporte Integral (Completado)
- **Componente:** Generación de Reportes Avanzados
- **Estado:** Se ajustaron los modelos de EF Core (ReporteBaseDto) y los Stored Procedures para incluir una "Sección 0" base, y filtrar resultados null/vacíos con INNER JOIN.
- **UI:** La tabla HTML y exportación en Angular ahora son estrictamente condicionales utilizando lógica `@if (data.seccion.length > 0)`.
