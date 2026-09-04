# PLAN: Inventario de Licencias Update - UI/DB Fixes

## 1. Architecure
- **Database**: Add `CantidadContratada` and `FechaVencimiento` to `pt_TiposLicencia` via raw SQL script format.
- **Frontend App**: Patched missing columns in the `catalogos.component.ts` table logic using robust inline patching.

## 2. Steps Execution
- [x] Extracted `ALTER VIEW` and `ALTER PROCEDURE` to `LICENCIAS_DB_UPDATE.sql`.
- [x] Safely patched `src/src/app/components/catalogos/catalogos.component.ts` template.
- [x] Validated Angular template build errors gracefully.
- [x] Passed Playwright visual verification perfectly.
