# PLAN: Inventario de Licencias Update

## 1. Architecure
- **Database**: Add `CantidadContratada` and `FechaVencimiento` to `pt_TiposLicencia`.
- **Backend API**: Add fields to DTOs in `Models.cs` and pass params to SPs in `CatalogosController`. Validated business logic in `PlataformasController` for availability.
- **Frontend App**: Added inputs for Cantidad/Fecha in the catalogs module. Implemented dropdown UI styling and disabling logic for invalid licenses.

## 2. Steps Execution
- [x] Generated `README_DB.md` with required script for Database Admin (external server).
- [x] Refactored `CatalogosController.cs` and `PlataformasController.cs`.
- [x] Patched `catalogos.component.ts` and `plataformas.component.ts` UI cleanly with Angular markup.
- [x] Verified build.
- [x] Successfully verified UI updates with Playwright.
