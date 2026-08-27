**Objetivo 1: Modificar Script SQL**
- Cambiar `STRING_AGG(..., ', ')` por `STUFF(..., 1, 2, '')` con `FOR XML PATH('')`.
- Las consultas CTE que agrupaban el hardware ahora deben usar subconsultas FOR XML PATH.

*CTE Actual:*
```sql
HardwareIdealAgrupado AS (
    SELECT
        PuestoId,
        STRING_AGG(ISNULL(TipoEquipo, 'N/A'), ', ') AS IdealTipo,
        STRING_AGG(ISNULL(Procesador, 'N/A'), ', ') AS IdealProcesador,
        STRING_AGG(ISNULL(Memoria, 'N/A'), ', ') AS IdealMemoria
    FROM pt_HardwareIdeal
    GROUP BY PuestoId
),
```

*Nueva versión compatible:*
```sql
HardwareIdealAgrupado AS (
    SELECT
        PuestoId,
        STUFF((SELECT ', ' + ISNULL(TipoEquipo, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealTipo,
        STUFF((SELECT ', ' + ISNULL(Procesador, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealProcesador,
        STUFF((SELECT ', ' + ISNULL(Memoria, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealMemoria
    FROM pt_HardwareIdeal h1
    GROUP BY PuestoId
),
```
Hacer lo mismo para `HardwareAsignadoAgrupado` (agrupar por `EmpleadoId`).
Hacer lo mismo para `PuestosDelEmpleado` (agrupar por `EmpleadoId`, buscar `pt_Puestos_X_Empleado` y juntar nombre, codigo de puesto, e ideales).

**Objetivo 2: Frontend**
- En `comparativa-hardware.component.ts`:
  - En `loadData()` o en `ngOnInit()`, invocar a `api.getPuestos()`. El combobox actualmente se estaba llenando extrayendo puestos únicos de la `listaComparativas`, que estaba vacía probablemente por los INNER JOINS o algún error (tal vez el SP/Vista estaba fallando en la DB, lo cual explica por qué devolvía vacío). Al llamar a `api.getPuestos()`, la lista existirá sí o sí.
  - Asegurar la limpieza `.filter(item => item.nombrePuesto != null && item.nombrePuesto !== 'undefined')`.
  - Corregir el `<select>` en el HTML que se había quejado de "recuadro gris extra que duplica el texto".
