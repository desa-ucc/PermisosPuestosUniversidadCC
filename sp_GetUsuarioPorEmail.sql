CREATE PROCEDURE sp_GetUsuarioPorEmail
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Se asume que el NombreUsuario almacena el correo institucional
    SELECT
        u.Id,
        u.NombreUsuario,
        u.RolId,
        u.EsActivo,
        r.Nombre AS NombreRol
    FROM pt_Usuarios u
    INNER JOIN pt_Roles r ON u.RolId = r.Id
    WHERE (u.NombreUsuario = @Email OR u.Correo = @Email) AND u.EsActivo = 1;
END
