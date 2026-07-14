ALTER PROCEDURE [dbo].[sp_GetHardwareAsignado]
AS
BEGIN
    SELECT
        h.Id,
        h.EmpleadoId,
        h.TipoHardwareId,
        ISNULL(th.Nombre, h.TipoEquipo) AS TipoEquipo,
        h.Procesador,
        h.Memoria,
        h.Disco,
        h.MarcaPC,
        h.OtrasConsideraciones,
        h.Placa,
        e.CodigoEmpleado AS CodigoPuesto,
        p.NombrePuesto AS NombrePuesto
    FROM pt_HardwareAsignado h
    LEFT JOIN Cat_TiposHardware th ON h.TipoHardwareId = th.Id
    LEFT JOIN pt_Empleados e ON h.EmpleadoId = e.Id
    LEFT JOIN pt_Puestos p ON e.PuestoId = p.Id;
END;
GO

ALTER PROCEDURE [dbo].[sp_GetHardwareIdeal]
AS
BEGIN
    SELECT
        h.Id,
        h.PuestoId,
        h.TipoHardwareId,
        ISNULL(th.Nombre, h.TipoEquipo) AS TipoEquipo,
        h.Procesador,
        h.Memoria,
        h.Disco,
        h.MarcaPC,
        h.OtrasConsideraciones,
        p.CodigoPuesto AS CodigoPuesto,
        p.NombrePuesto AS NombrePuesto
    FROM pt_HardwareIdeal h
    LEFT JOIN Cat_TiposHardware th ON h.TipoHardwareId = th.Id
    LEFT JOIN pt_Puestos p ON h.PuestoId = p.Id;
END;
GO
