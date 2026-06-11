# PLAN: Standardize Table Filters

## Architecture
- **UI Pattern**: Added a `<tr>` inside `<thead>` of all data tables. Each `<td>` contains an `<input>` bound to a component property (`[(ngModel)]="filtroX"`).
- **Styling**: `w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary`.
- **Filtering Logic**: Components use a `get listaFiltradaTabla()` (or similar) getter that computes the filtered array. The pagination getters (`paginatedList`, `totalPages`) read from this filtered array instead of the raw data.
- **UX**: Added a "Limpiar Filtros" button to reset the filter properties and reset the `currentPage` to 1.

## Steps Executed
1. Inspected table headers across `ColaboradoresComponent`, `HardwareIdealComponent`, `HardwareComponent`, `SoftwareComponent`, `SitiosComponent`, and `PlataformasComponent`.
2. Created custom Node.js scripts to inject the `<tr>` with inputs, the filtering variables, the computed getter, and the `limpiarFiltrosTabla()` function.
3. Updated the `paginatedList` and `totalPages` getters to rely on the filtered list.
4. Validated visually by ensuring the code structures align exactly with the requirements.
5. Ran `ng test` to ensure stability.

## Final Result
The system is now completely consistent, matching the standard established in the requirements.
