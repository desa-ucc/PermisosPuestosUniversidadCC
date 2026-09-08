# PLAN: Dashboard Modules for Licenses

## 1. Architecure
- **Frontend App**: Extracted the previously inline template of the dashboard to `dashboard.component.html` in order to comply with the house rules. Appended the visual logic for two analytical sections: Active Licenses table, and Alert Cards for expiring items.
- **Backend API**: Engineered the `/Reportes/dashboard-licencias` endpoint in `ReportesController.cs`. Calculates availabilities logically, isolating Active licenses with no future expirations, and separating inactive ones or past due.

## 2. Steps Execution
- [x] Refactored `dashboard.component.ts`.
- [x] Mapped `Models.cs` with the missing response structures.
- [x] Verified full build compilation natively across the stack.
- [x] Successfully audited and approved by code review.
