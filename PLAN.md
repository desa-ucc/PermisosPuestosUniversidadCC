# Plan for Fixing Reportes Component

## Issue
The issue is that sections in the "Reporte Integral" are generated even when there is no data for a particular section for a given employee/position, causing empty rows (or rows with N/A) to appear in the UI and the Excel export.
Also, based on the `ReportesController.cs` read earlier, the code currently uses raw inline SQL instead of Stored Procedures for the Integral report. The memory specifically dictates: **"Database Interaction Rule: NEVER use LINQ to Entities for direct SELECT, INSERT, UPDATE, or DELETE. 100% of database interactions must use Stored Procedures via EF Core's FromSqlRaw or ExecuteSqlRaw."**

We need to apply the following golden rules:
1. Always show the base information of Employee and Position (Sección Principal).
2. If a section (hardware, bases de datos, sitios, software local, plataformas, etc.) has real data, show it.
3. If a section has NO data, hide it completely in the UI and do not export it to the Excel sheet.

## Proposed Plan

1.  **Modify Backend Models (`Models.cs`)**
    *   Add a new DTO `ReporteBaseDto` to hold the core Employee/Position data (`CodigoPuesto`, `Puesto`, `Nombre`, `Correo`).
    *   Update `ReporteIntegralResponse` to include a `List<ReporteBaseDto> InformacionBase` property.
    *   *Verification:* Read `Models.cs` to confirm modifications.

2.  **Modify DB Context (`AppDbContext.cs`)**
    *   Add `DbSet<ReporteBaseDto> ReportesBaseDto` and configure it in `OnModelCreating` as `.HasNoKey()`.
    *   *Verification:* Read `AppDbContext.cs` to confirm modifications.

3.  **Update Database (`update_reportes_sp.sql`)**
    *   Create a `.sql` script that defines the following stored procedures (using `INNER JOIN` where appropriate to filter out nulls, except for the base information which uses `LEFT JOIN`):
        *   `sp_GetReporteIntegral_Base` (Returns all matching employees/puestos, joining `pt_Empleados` and `pt_Puestos`)
        *   `sp_GetReporteIntegral_Hardware` (INNER JOIN `pt_HardwareAsignado`)
        *   `sp_GetReporteIntegral_Sitios` (INNER JOIN `pt_PermisosSitio`)
        *   `sp_GetReporteIntegral_Plataformas` (INNER JOIN `pt_Plataformas`)
        *   `sp_GetReporteIntegral_BasesDatos` (INNER JOIN `pt_AccesosBD`)
        *   `sp_GetReporteIntegral_SoftwareLocal` (INNER JOIN `pt_SoftwareLocal`)
        *   `sp_GetReporteIntegral_EquipoIdeal` (INNER JOIN `pt_HardwareIdeal`)
    *   Execute this script in the backend via a temporary endpoint to ensure the SPs are deployed.
    *   *Verification:* Confirm script executes successfully.

4.  **Update SQL Queries in Controller (`ReportesController.cs`)**
    *   Replace all inline SQL queries in `GetReporteIntegral` with calls to the newly created Stored Procedures via `FromSqlRaw`.
    *   *Verification:* Build the backend (`dotnet build`) to ensure no compilation errors.

5.  **Update Frontend State and Pagination (`reportes.component.ts`)**
    *   Initialize `informacionBase: []` in the `data` object.
    *   Add pagination logic and getters for `informacionBase`.

6.  **Update Frontend UI (`reportes.component.ts` Template)**
    *   Add a new "Sección 0: Información General" section at the top of the results. This section will ALWAYS display if there are matches (based on the `informacionBase` array).
    *   Wrap every other section in an Angular `@if (data.seccion && data.seccion.length > 0)` control flow block so they completely hide when empty.

7.  **Update Excel Export (`reportes.component.ts`)**
    *   Add logic to export `InformacionBase` as the first sheet.
    *   Ensure all subsequent sheets are conditionally added ONLY if their respective array has `length > 0`.
    *   *Verification:* Compile frontend to ensure no build errors.

8.  **Run All Relevant Tests**
    * Run backend tests (if any) and frontend tests (`ng test`) to ensure regressions were not introduced.

9. **Playwright UI Verification**
    * Run a Playwright script to verify the UI changes conditionally render sections and produce screenshot and video in verification directories.

10. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**

11. **Submit**
