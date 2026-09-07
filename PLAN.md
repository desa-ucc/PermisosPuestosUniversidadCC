# PLAN: Submission Payload Update Fix 3 (Estado/Activo)

## 1. Architecure
- **Frontend App**: Added active status field to tracking form for Licenses.
- **Backend API**: Added `@Activo` parameter to the SP calls and DTOs mapping.
- **Database**: Extracted T-SQL instruction for adding `Activo` property natively on database schema setup.

## 2. Steps Execution
- [x] Refactored `CatalogosController.cs` and `catalogos.component.ts`.
- [x] Verified full build compilation natively across the stack.
- [x] Successfully audited and approved by code review.
