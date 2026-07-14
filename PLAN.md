# Payload Mapping for Stored Procedure Update (`sp_UpdateHardwareAsignado` & `sp_UpdateHardwareIdeal`)

## Issue
The backend SQL stored procedures were updated to expect a numeric `@TipoHardwareId (INT)` instead of `@TipoEquipo (NVARCHAR)` for the update routines, causing failures when updating the form records. The forms still mapped their inner workings using the textual descriptions for initial UI bindings.

## Steps
1. Updated `Models.cs` classes `HardwareAsignado` and `HardwareIdeal` with `public int? TipoHardwareId { get; set; }`.
2. Replaced `@TipoEquipo` with `@TipoHardwareId` parameter in the execution methods of `EquiposController.cs` and `HardwareIdealController.cs`, utilizing DBNull safely if not parsed.
3. Updated the Angular `onSubmit()` logic inside `HardwareComponent` and `HardwareIdealComponent` to explicitly inject `data.tipoHardwareId = this.selectedTipoHardwareId` before mapping the update call to the API.
