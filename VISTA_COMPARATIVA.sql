-- =========================================================================================
-- SCRIPT DE VISTA: COMPARATIVA DE HARDWARE (GAP ANALYSIS)
-- Propósito: Generar la estructura cruzada para comparar el Hardware Asignado vs Equipo Ideal
-- =========================================================================================

CREATE OR ALTER VIEW v_ComparativaEquipos AS
SELECT
    e.NombreCompleto AS Empleado,
    p.CodigoPuesto,
    p.NombrePuesto AS Puesto,

    -- Equipo Ideal (Basado en el Puesto de trabajo)
    hi.TipoEquipo AS IdealTipo,
    hi.Procesador AS IdealProcesador,
    hi.Memoria AS IdealMemoria,

    -- Equipo Asignado (Basado en lo que tiene el Empleado físicamente)
    ha.TipoEquipo AS AsignadoTipo,
    ha.Procesador AS AsignadoProcesador,
    ha.Memoria AS AsignadoMemoria

FROM pt_Empleados e
LEFT JOIN pt_Puestos_X_Empleado pxe ON e.Id = pxe.EmpleadoId
LEFT JOIN pt_Puestos p ON pxe.PuestoId = p.Id
LEFT JOIN pt_HardwareIdeal hi ON p.Id = hi.PuestoId
LEFT JOIN pt_HardwareAsignado ha ON e.Id = ha.EmpleadoId;
GO
