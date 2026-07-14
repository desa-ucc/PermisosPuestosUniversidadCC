# Direct Mapping for Edit Constraints using Extracted SQL Properties

## Context
When loading a record in 'edit' or 'read-only' views, the fallback string mapping caused failures because the backend properly extracts and maps `TipoHardwareId` automatically inside `sp_GetHardwareAsignado` and `sp_GetHardwareIdeal`. Thus, looking up the index via strings `this.hwForm.patchValue({ tipoEquipo: matchedTipo.nombre })` was flawed due to `typeof` discrepancies preventing the Angular forms selector rendering properly.

## Fix
- Replaced the string mapping mechanism and injected the direct binding via `this.selectedTipoHardwareId = hw.tipoHardwareId || null;`
- Reverted the workaround explicitly mapping internal arrays, given the fact that `<select>` uses `formControlName="tipoHardwareId"`, which natively binds cleanly upon standard Angular `patchValue(hw)` calls.
- Enforced constraint re-evaluation using `this.onTipoHardwareChange(this.selectedTipoHardwareId)` utilizing the mapped id automatically, removing any edge cases or regressions.
