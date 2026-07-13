# Plan de Implementación: Formulario Dinámico de Hardware

## 1. Backend (.NET API)
- **Modelos (`Models.cs`)**:
  - Crear la entidad `Cat_TipoHardware` (`Id`, `Nombre`, `Activo`).
  - Actualizar `HardwareAsignado` y `HardwareIdeal` añadiendo `int TipoHardwareId` y cambiando `TipoEquipo` a `string?`.
- **DbContext (`AppDbContext.cs`)**:
  - Añadir `DbSet<Cat_TipoHardware> Cat_TiposHardware`.
- **Controladores**:
  - `CatalogosController.cs`: Añadir los endpoints CRUD para `TiposHardware` que consuman `sp_GestionarTiposHardware`.
  - `EquiposController.cs`: Modificar los parámetros del stored procedure `sp_CreateHardwareAsignado` y `sp_UpdateHardwareAsignado` para utilizar `@TipoHardwareId` en lugar de `@TipoEquipo`.
  - `HardwareIdealController.cs`: Modificar los parámetros de `sp_InsertHardwareIdeal` y `sp_UpdateHardwareIdeal` para usar `@TipoHardwareId`.

## 2. Frontend (Angular)
- **Modelos (`models.ts`)**:
  - Añadir interfaz `CatTipoHardware`.
  - Actualizar interfaces `HardwareAsignado` y `HardwareIdeal` (`tipoHardwareId: number`).
- **Servicios (`api.service.ts`)**:
  - Implementar llamadas a la API para el catálogo `TiposHardware`.
- **Componente Catálogos (`catalogos.component.ts`)**:
  - Añadir la pestaña "Tipos de Hardware".
  - Integrar la visualización, creación, edición y eliminación (consumiendo el nuevo endpoint).
- **Componente Hardware Asignado (`hardware.component.ts`)**:
  - Cargar el catálogo de `TiposHardware` al iniciar.
  - Reemplazar el campo de texto `tipoEquipo` en el formulario con un `<select>` enlazado a `tipoHardwareId`.
  - Implementar método `onTipoHardwareChange(id)` para detectar si es "Laptop" o "Desktop" y manejar la visibilidad condicional de los campos (`procesador`, `memoria`, `disco`, `marcaPC`).
  - Actualizar validadores condicionalmente (remover `Validators.required` si no es PC).
  - Usar `@if` o `*ngIf` para mostrar/ocultar los campos en la vista.
- **Componente Equipo Ideal (`hardware-ideal.component.ts`)**:
  - Aplicar las mismas lógicas del select dinámico, método `onTipoHardwareChange` y visibilidad de campos que en Hardware Asignado.

## 3. Pre-commit
- Asegurar de que la compilación backend (.NET) funcione correctamente (`dotnet build`).
- Asegurar que frontend compile (opcionalmente si puedo correrlo o solo validar tipos).
- Realizar revisiones.

## Audit
- Created `Cat_TipoHardware` schema in backend and `tiposhardware` endpoint.
- Updated `HardwareAsignado` and `HardwareIdeal` arrays.
- Dynamically rendered conditionals in forms for both hardware assignments and templates.
- Backend/Frontend builds passed.
