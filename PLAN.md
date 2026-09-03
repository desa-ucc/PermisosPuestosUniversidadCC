# PLAN: Comparativa Hardware Update

## 1. Architecure
- **Database**: Add columns to SQL Server view (`v_ComparativaEquipos`).
- **Backend API**: Add fields to `ComparativaHardwareDto` and update the entity model.
- **Frontend App**: Use flexible JS string comparison rules for validation logic and update HTML table for presentation.

## 2. Steps Execution
- [x] Generated `VISTA_COMPARATIVA.sql` with new joins and projection rules.
- [x] Refactored `ComparativasController.cs` in PermisosPuestosApi.
- [x] Added `calcularEstadoGlobal` pattern matching algorithm and updated `comparativa-hardware.component.ts`.
- [x] Verified full build and tested the application's angular UI using playwright verification scripts.
