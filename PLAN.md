# Address SQL Injection Failures on Creation

## Issue
Upon submitting new items in `HardwareIdeal` and `HardwareAsignado`, SQL Server silently failed inserting via C# constraints. After logging the `try / catch` natively it became obvious that the user changed the creation SPs (`sp_CreateHardwareAsignado` and `sp_CreateHardwareIdeal`) to require BOTH `@TipoHardwareId` and `@TipoEquipo` simultaneously to satisfy NOT NULL configurations.

## Changes
- Addressed `EquiposController.cs` and `HardwareIdealController.cs` to supply both parameters to `ExecuteSqlRawAsync` sequentially ensuring SQL parameter bindings are not dropped.
- Altered Angular `HardwareComponent` and `HardwareIdealComponent` controllers `onSubmit()` routine to resolve the textual representations and send `.tipoEquipo = this.getTipoName(...)` mapping to the ID selected.
- Cleaned up pre-commit validation.

## Fix visibility logic for PC fields in Hardware Ideal

### Issue
The fields 'Procesador', 'Memoria RAM', 'Disco Duro', and 'Marca de PC' were always visible in the `HardwareIdealComponent` instead of being conditionally displayed based on the selected hardware type (Laptop, Desktop, Computadora).

### Changes
- Updated the `isPC` getter to include 'computadora' for both `HardwareComponent` and `HardwareIdealComponent`.
- Wrapped 'Procesador', 'Memoria RAM', and 'Marca de PC' fields in the `HardwareIdealComponent` HTML template with `@if(isPC)` control flow to correctly toggle their visibility.
- Updated `onTipoHardwareChange` in `HardwareIdealComponent` to explicitly null out hidden fields when `isPC` is false, removing the `!isEditing` condition to prevent hidden invalid states or backend SQL constraint violations.

## Update Hardware Ideal UI and Data Presentation

### Issue
When specific components like Processor or Memory were hidden, the form layout appeared 'broken' due to fixed CSS Grid sizes. In the table, empty attributes were completely blank, making the presentation appear missing or incomplete.

### Changes
- Changed form grid layouts to `flex flex-wrap gap-4` and appended `flex-1 min-w-[250px]` with transition-all wrappers for form child `<div class="flex flex-col">` layouts to dynamically scale spacing natively without breaking.
- Appended `|| 'N/A'` fallbacks in Hardware Ideal components Table loop display.
- Matched Flex properties to `hardware.component.ts`.

## Fix Seguridad roles not loading

### Issue
The user noted that the Roles table is empty despite backend having records. The `SeguridadComponent` initializes properly with `ngOnInit` loading `this.cargarRoles()`, however the API endpoint `/api/seguridad/roles` throws a 500 server error silently to the console. This happens because the `SeguridadController` used raw string interpolation for `@Accion` instead of explicit SqlParameters which breaks EF Core strict configurations as required by memory.
Additionally, when switching tabs using `setTab`, the system did not automatically fetch data if not loaded.

### Changes
- Fixed `GetRoles` and `GetUsuarios` inside `SeguridadController.cs` to correctly instantiate `new SqlParameter("@Accion", "SELECT")`.
- Implemented data reloading logic in `setTab` natively inside `seguridad.component.ts`.
