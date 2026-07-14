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
