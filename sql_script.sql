ALTER PROCEDURE sp_Getpt_SoftwareLocales
AS
BEGIN
    SELECT
        S.Id,
        S.EmpleadoId,
        ISNULL(H.Placa + ' - ' + H.MarcaPC, 'Desconocido') AS Equipo,
        S.GruposAD,
        S.NombreSoftware,
        S.Version,
        S.Fabricante
    FROM pt_SoftwareLocal S
    LEFT JOIN pt_HardwareAsignado H ON S.EmpleadoId = H.EmpleadoId
END;
GO
