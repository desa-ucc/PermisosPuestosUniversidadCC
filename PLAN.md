# PLAN: Implement Master Toolbar Pattern Universally

## Architecture
The client required that all modules conform identically to the newly polished UI Toolbar for filtering. The HTML structure, CSS classes, layout paradigms (`flex`, `gap-3`, `ml-auto`), and TS methods (`aplicarFiltros()`, `limpiarFiltros()`) must match perfectly.

## Steps Executed
1. Formatted the "Master Toolbar" HTML structure requested by the user.
2. Built an automated Node.js transformation script that injected this exact HTML structure into `PuestosComponent`, `ColaboradoresComponent`, `HardwareIdealComponent`, `HardwareComponent`, `SoftwareComponent`, `SitiosComponent`, and `PlataformasComponent`.
3. Extended the TS logic insertion to include `aplicarFiltros()` and renamed old reset functions to the standard `limpiarFiltros()`.
4. Applied the change to `ReportesComponent` taking into account its single advanced filtering toolbar structure.
5. Successfully ran headless tests.

## Final Result
All tables within the system now feature an identical, deeply polished, and universally standard "Toolbar de Filtros" according to the Master Template.
