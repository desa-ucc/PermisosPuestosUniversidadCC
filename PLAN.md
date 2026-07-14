# Trapping SQL Constraints and Verifying Form Bindings

## Issue
Creation routines were failing silently or logging generic responses. The underlying SQL error was opaque. Furthermore, `console.log` payloads inside the submission were requested to verify data types mapping to the respective updated Stored Procedure inputs (`TipoHardwareId` as INT instead of `TipoEquipo`).

## Implementation Steps
1. Add `try / catch` wrappers inside `.NET` controllers (`EquiposController` and `HardwareIdealController`) for the HTTP POST (create) methods. Replaced hardcoded `EXEC` params from `@TipoEquipo` to `@TipoHardwareId` per spec updates.
2. The exception logs identically to standard output via `Console.WriteLine` natively intercepting the generic SQL driver exceptions, exposing the granular constraint violation to the backend.
3. Edited the Angular form intercepting the `submit()` binding, wrapping `this.api.create(...)` sequentially after invoking `console.log("Payload enviado:", data)` allowing local runtime payload debugging.
4. Models checked against DBNull safety constraints seamlessly evaluating valid payload structs.
