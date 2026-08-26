-- =========================================================================================
-- SCRIPT DE VISTA: COMPARATIVA DE HARDWARE (GAP ANALYSIS) V3
-- Propósito: Generar estructura cruzada agrupada sin producto cartesiano usando FOR XML PATH
-- =========================================================================================

CREATE OR ALTER VIEW v_ComparativaEquipos AS
WITH HardwareIdealAgrupado AS (
    SELECT
        h1.PuestoId,
        STUFF((SELECT ', ' + ISNULL(h2.TipoEquipo, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealTipo,
        STUFF((SELECT ', ' + ISNULL(h2.Procesador, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealProcesador,
        STUFF((SELECT ', ' + ISNULL(h2.Memoria, 'N/A') FROM pt_HardwareIdeal h2 WHERE h2.PuestoId = h1.PuestoId FOR XML PATH('')), 1, 2, '') AS IdealMemoria
    FROM pt_HardwareIdeal h1
    GROUP BY h1.PuestoId
),
HardwareAsignadoAgrupado AS (
    SELECT
        a1.EmpleadoId,
        STUFF((SELECT ', ' + ISNULL(a2.TipoEquipo, 'N/A') FROM pt_HardwareAsignado a2 WHERE a2.EmpleadoId = a1.EmpleadoId FOR XML PATH('')), 1, 2, '') AS AsignadoTipo,
        STUFF((SELECT ', ' + ISNULL(a2.Procesador, 'N/A') FROM pt_HardwareAsignado a2 WHERE a2.EmpleadoId = a1.EmpleadoId FOR XML PATH('')), 1, 2, '') AS AsignadoProcesador,
        STUFF((SELECT ', ' + ISNULL(a2.Memoria, 'N/A') FROM pt_HardwareAsignado a2 WHERE a2.EmpleadoId = a1.EmpleadoId FOR XML PATH('')), 1, 2, '') AS AsignadoMemoria
    FROM pt_HardwareAsignado a1
    GROUP BY a1.EmpleadoId
),
PuestosDelEmpleado AS (
    SELECT
        pxe1.EmpleadoId,
        STUFF((SELECT ', ' + ISNULL(p2.CodigoPuesto, 'N/A')
               FROM pt_Puestos_X_Empleado pxe2
               LEFT JOIN pt_Puestos p2 ON pxe2.PuestoId = p2.Id
               WHERE pxe2.EmpleadoId = pxe1.EmpleadoId FOR XML PATH('')), 1, 2, '') AS CodigoPuesto,

        STUFF((SELECT ', ' + ISNULL(p2.NombrePuesto, 'N/A')
               FROM pt_Puestos_X_Empleado pxe2
               LEFT JOIN pt_Puestos p2 ON pxe2.PuestoId = p2.Id
               WHERE pxe2.EmpleadoId = pxe1.EmpleadoId FOR XML PATH('')), 1, 2, '') AS Puesto,

        STUFF((SELECT ' | ' + ISNULL(hi2.IdealTipo, 'N/A')
               FROM pt_Puestos_X_Empleado pxe2
               LEFT JOIN pt_Puestos p2 ON pxe2.PuestoId = p2.Id
               LEFT JOIN HardwareIdealAgrupado hi2 ON p2.Id = hi2.PuestoId
               WHERE pxe2.EmpleadoId = pxe1.EmpleadoId FOR XML PATH('')), 1, 3, '') AS IdealTipo,

        STUFF((SELECT ' | ' + ISNULL(hi2.IdealProcesador, 'N/A')
               FROM pt_Puestos_X_Empleado pxe2
               LEFT JOIN pt_Puestos p2 ON pxe2.PuestoId = p2.Id
               LEFT JOIN HardwareIdealAgrupado hi2 ON p2.Id = hi2.PuestoId
               WHERE pxe2.EmpleadoId = pxe1.EmpleadoId FOR XML PATH('')), 1, 3, '') AS IdealProcesador,

        STUFF((SELECT ' | ' + ISNULL(hi2.IdealMemoria, 'N/A')
               FROM pt_Puestos_X_Empleado pxe2
               LEFT JOIN pt_Puestos p2 ON pxe2.PuestoId = p2.Id
               LEFT JOIN HardwareIdealAgrupado hi2 ON p2.Id = hi2.PuestoId
               WHERE pxe2.EmpleadoId = pxe1.EmpleadoId FOR XML PATH('')), 1, 3, '') AS IdealMemoria
    FROM pt_Puestos_X_Empleado pxe1
    GROUP BY pxe1.EmpleadoId
)
SELECT
    e.NombreCompleto AS Empleado,
    pe.CodigoPuesto,
    pe.Puesto,

    pe.IdealTipo,
    pe.IdealProcesador,
    pe.IdealMemoria,

    ha.AsignadoTipo,
    ha.AsignadoProcesador,
    ha.AsignadoMemoria

FROM pt_Empleados e
LEFT JOIN PuestosDelEmpleado pe ON e.Id = pe.EmpleadoId
LEFT JOIN HardwareAsignadoAgrupado ha ON e.Id = ha.EmpleadoId;
GO
