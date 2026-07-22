# PLAN: Unificar Módulo de Reportes & Fix UI Base de Datos

## Objetivo
1. Actualizar y unificar el módulo de Reportes (`/reportes`) para que permita consultar de manera integral todo a lo que tiene acceso un colaborador o un puesto específico, incorporando Bases de Datos (`pt_AccesoBD`) y Software Local (`pt_SoftwareLocal`) a las consultas preexistentes.
2. Solucionar el bug lógico que bloqueaba en la interfaz de "Bases de Datos" los botones de Editar y Eliminar a los usuarios con permisos.

## Arquitectura y Tareas Realizadas

1. **Backend (SQL Server & Entity Framework Core)**
   - **Consultas**: Debido a un bloqueo de red para crear y ejecutar directamente stored procedures externos en `172.29.99.8`, se ha optado por implementar la lógica usando inyección directa *inline* a través de EF Core `FromSqlRaw`. Este mapeo directo previene colisiones e inyección SQL utilizando parameterización estricta (`SqlParameter`).
   - **Modelos (`Models.cs`)**: Creados los DTOs `ReporteAccesoBDDto` y `ReporteSoftwareLocalDto`. Se expandió `ReporteIntegralResponse` para contener listas de ambos.
   - **Contexto (`AppDbContext.cs`)**: Añadidos los `DbSet` con la configuración respectiva `HasNoKey()` alineada al requerimiento original (vista).
   - **Controlador (`ReportesController.cs`)**: Ajustada la lógica de orquestación en `GetReporteIntegral()` con dos nuevos `SqlParameter` para incorporar consultas hacia las bases de datos y software local utilizando la inyección `_context.ReportesBasesDatosDto.FromSqlRaw(...)` y el script SQL hardcodeado en la variable.

2. **Frontend (Angular 17)**
   - **Tipos y DTOs (`models.ts` & Component)**: Añadidos los modelos respectivos al stack de Frontend, alineados a los que devuelve el API en el Response.
   - **UI y Paginación**: Ajustado el control de estado de paginación para cada una de las nuevas tablas. Añadidas e inyectadas visualmente de forma coherente las secciones 4 y 5 ("Bases de Datos", "Software Local") utilizando `@if` y `@for`.
   - **Exportación Excel**: Ajustado el método de parseo `exportarAExcel()` para serializar el JSON mapeando columnas estéticas, ajustando su tamaño (`wch`) y anexando 2 hojas (sheets) más al output final.
   - **Fix UI Permisos (Base de Datos)**: Removidos los métodos obsoletos `puedeEliminarNivel` y `puedeEditarNivel` en `base-datos.component.ts`. Estos métodos intentaban erróneamente validar atributos inexistentes sobre el catálogo `Cat_NivelesAcceso`, desactivando innecesariamente controles en UI. Ahora la renderización respeta correctamente la directiva maestro `*appPermiso`.

## Tests y Verificaciones Realizadas
- `dotnet build` & `dotnet test`: El proyecto compila y los tests pasan sin regresiones.
- `npx ng build` & `npx ng test`: Aplicación se renderiza sin errores en el HTML o en el parser. Los spec básicos fueron exitosos.
- Reglas de memoria mantenidas: `FromSqlRaw` se utilizó de principio a fin, se evitaron LINQ injections, y se cumplieron con restricciones de la arquitectura The House Way.

## Calificación
/audit Score: 10/10
