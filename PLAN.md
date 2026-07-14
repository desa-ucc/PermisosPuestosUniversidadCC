# Hardware Select Sync and Form Validation Patch

## Context
When loading data for tables, `sp_GetHardwareIdeal` and `sp_GetHardwareAsignado` omitted `TipoHardwareId`, failing to bind `<select>` dropdowns in edit mode accurately. Secondly, the tables continued displaying text directly populated into `TipoEquipo`, which may be inaccurate based on database data structures for the newly adopted `TipoHardwareId`.

## Changes Made
- Modified `sql_patch.sql` to explicitly add `h.TipoHardwareId` to the `SELECT` of the Stored Procedures.
- Refactored `HardwareComponent` and `HardwareIdealComponent` HTML code to utilize `[value]="tipo.id"` alongside `formControlName="tipoHardwareId"`, mapping appropriately back to `Cat_TiposHardware.Id`.
- Added a `getTipoName(tipoId: number | null | undefined, fallback: string): string` logic mapping for Angular templates.
- Replaced direct string bindings (e.g. `{{hw.tipoEquipo}}`) with `{{ getTipoName(hw.tipoHardwareId, hw.tipoEquipo) }}`.
- Refactored filter mappings `matchEquipo` to look up matching characters directly from `this.getTipoName(...)`.
- Added `tipoHardwareId?: number;` to both `HardwareAsignado` and `HardwareIdeal` interfaces inside `models.ts`.
- Validated application compiles without errors.
