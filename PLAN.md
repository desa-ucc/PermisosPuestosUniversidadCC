# Hardware Type Select UI & Logic Updates

## Architecture

The system uses an Angular reactive form pattern for creating and editing 'Hardware' and 'Hardware Ideal' components.
We migrated the manual string inputs for 'tipoEquipo' to a dynamic dropdown populated from the backend ('Cat_TiposHardware').
Based on the selected string item in this dropdown, we derive an `isPC` boolean and conditionally mount fields (Procesador, Memoria RAM, Disco Duro, Marca de PC) using the `@if` syntax in the template. If the component mounts dynamically, we dynamically apply or clear `Validators.required` logic using `updateValueAndValidity()`.

## Changes Made
- Added `getTiposHardware` integration inside `ngOnInit` via `loadData` for both components.
- Modified HTML inputs into `<select>` binding to `formControlName="tipoEquipo"` emitting standard change events to evaluate logic.
- Included logic that when `isPC == false`, residual string values are aggressively set to `null` by calling `patchValue(null)` to prevent validation constraints.
- Pre-commit verifications validated compiling passes successfully and the frontend handles interactions logically.
