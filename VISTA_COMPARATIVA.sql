-- =========================================================================================
-- SCRIPT DE VISTA: COMPARATIVA DE HARDWARE (GAP ANALYSIS) V2
-- Propósito: Generar estructura cruzada agrupada sin producto cartesiano usando STRING_AGG
-- =========================================================================================

CREATE OR ALTER VIEW v_ComparativaEquipos AS
WITH HardwareIdealAgrupado AS (
    SELECT
        PuestoId,
        STRING_AGG(ISNULL(TipoEquipo, 'N/A'), ', ') AS IdealTipo,
        STRING_AGG(ISNULL(Procesador, 'N/A'), ', ') AS IdealProcesador,
        STRING_AGG(ISNULL(Memoria, 'N/A'), ', ') AS IdealMemoria
    FROM pt_HardwareIdeal
    GROUP BY PuestoId
),
HardwareAsignadoAgrupado AS (
    SELECT
        EmpleadoId,
        STRING_AGG(ISNULL(TipoEquipo, 'N/A'), ', ') AS AsignadoTipo,
        STRING_AGG(ISNULL(Procesador, 'N/A'), ', ') AS AsignadoProcesador,
        STRING_AGG(ISNULL(Memoria, 'N/A'), ', ') AS AsignadoMemoria
    FROM pt_HardwareAsignado
    GROUP BY EmpleadoId
),
PuestosDelEmpleado AS (
    SELECT
        pxe.EmpleadoId,
        STRING_AGG(p.CodigoPuesto, ', ') AS CodigoPuesto,
        STRING_AGG(p.NombrePuesto, ', ') AS Puesto,
        STRING_AGG(hi.IdealTipo, ' | ') AS IdealTipo,
        STRING_AGG(hi.IdealProcesador, ' | ') AS IdealProcesador,
        STRING_AGG(hi.IdealMemoria, ' | ') AS IdealMemoria
    FROM pt_Puestos_X_Empleado pxe
    LEFT JOIN pt_Puestos p ON pxe.PuestoId = p.Id
    LEFT JOIN HardwareIdealAgrupado hi ON p.Id = hi.PuestoId
    GROUP BY pxe.EmpleadoId
)
SELECT
    e.NombreCompleto AS Empleado,
    pe.CodigoPuesto,
    pe.Puesto,

    -- Equipo Ideal (Basado en el Puesto de trabajo, concatenado si hay múltiples)
    pe.IdealTipo,
    pe.IdealProcesador,
    pe.IdealMemoria,

    -- Equipo Asignado (Basado en lo que tiene el Empleado físicamente)
    ha.AsignadoTipo,
    ha.AsignadoProcesador,
    ha.AsignadoMemoria

FROM pt_Empleados e
LEFT JOIN PuestosDelEmpleado pe ON e.Id = pe.EmpleadoId
LEFT JOIN HardwareAsignadoAgrupado ha ON e.Id = ha.EmpleadoId;
GO
