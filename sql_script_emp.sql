ALTER PROCEDURE sp_Getpt_SoftwareLocales
AS
BEGIN
    SELECT
        S.Id,
        S.EmpleadoId,
        ISNULL(E.NombreCompleto, 'Sin asignar') AS NombreEmpleado,
        S.GruposAD,
        S.NombreSoftware,
        S.Version,
        S.Fabricante
    FROM pt_SoftwareLocal S
    LEFT JOIN pt_Empleados E ON S.EmpleadoId = E.Id
END;
GO
