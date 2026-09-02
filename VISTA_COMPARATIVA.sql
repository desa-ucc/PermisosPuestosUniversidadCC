-- =========================================================================================
-- SCRIPT DE VISTA: COMPARATIVA DE HARDWARE (GAP ANALYSIS) V4
-- Propósito: Generar cruce de hardware ideal vs asignado usando estricto emparejamiento por tipo
-- =========================================================================================

CREATE OR ALTER VIEW v_ComparativaEquipos AS
SELECT
    e.NombreCompleto AS Empleado,
    p.CodigoPuesto,
    p.NombrePuesto AS Puesto,

    hi.TipoEquipo AS IdealTipo,
    hi.Procesador AS IdealProcesador,
    hi.Memoria AS IdealMemoria,

    ha.TipoEquipo AS AsignadoTipo,
    ha.Procesador AS AsignadoProcesador,
    ha.Memoria AS AsignadoMemoria

FROM pt_Empleados e
INNER JOIN pt_Puestos_X_Empleado pxe ON e.Id = pxe.EmpleadoId
INNER JOIN pt_Puestos p ON pxe.PuestoId = p.Id
INNER JOIN pt_HardwareIdeal hi ON p.Id = hi.PuestoId
INNER JOIN pt_HardwareAsignado ha ON e.Id = ha.EmpleadoId AND hi.TipoEquipo = ha.TipoEquipo;
GO
