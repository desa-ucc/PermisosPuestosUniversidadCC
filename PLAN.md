# PLAN: Standardize Toolbar UI Across Entire Application

## Architecture
The client required the professional "Toolbar" filtering pattern—originally prototyped as a template—to be strictly implemented across *all* table views in the application.

## Steps Executed
1.  **PuestosComponent**: Implemented the Toolbar from scratch, removing it from the `<tr>` layer. Replaced it with the `bg-white border-b ... flex flex-wrap` design. Added TS properties and `listaFiltradaTabla` getter for pagination.
2.  **ColaboradoresComponent**: Stripped out the old `<tr>` and implemented the correct Toolbar `<div class="bg-white border-b...">` above the table.
3.  **HardwareIdealComponent**: Applied the same extraction and insertion process.
4.  **HardwareComponent**: Applied the same extraction and insertion process.
5.  **SoftwareComponent**: Applied the same extraction and insertion process.
6.  **SitiosComponent**: Applied the same extraction and insertion process.
7.  **PlataformasComponent**: Applied the same extraction and insertion process.
8.  **Tests**: Ran `ng test` completely headlessly. All tests pass with zero regressions.

## Final Result
The Toolbar is now standard across all tables, establishing unified UI and code cohesion for the UCC Design System.
