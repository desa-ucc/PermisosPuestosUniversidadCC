# Address SQL Injection Failures on Creation

## Issue
Upon submitting new items in `HardwareIdeal` and `HardwareAsignado`, SQL Server silently failed inserting via C# constraints. After logging the `try / catch` natively it became obvious that the user changed the creation SPs (`sp_CreateHardwareAsignado` and `sp_CreateHardwareIdeal`) to require BOTH `@TipoHardwareId` and `@TipoEquipo` simultaneously to satisfy NOT NULL configurations.

## Changes
- Addressed `EquiposController.cs` and `HardwareIdealController.cs` to supply both parameters to `ExecuteSqlRawAsync` sequentially ensuring SQL parameter bindings are not dropped.
- Altered Angular `HardwareComponent` and `HardwareIdealComponent` controllers `onSubmit()` routine to resolve the textual representations and send `.tipoEquipo = this.getTipoName(...)` mapping to the ID selected.
- Cleaned up pre-commit validation.
