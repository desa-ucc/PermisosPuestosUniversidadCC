IF OBJECT_ID('sp_Login', 'P') IS NOT NULL DROP PROCEDURE sp_Login;
GO
CREATE PROCEDURE sp_Login
    @NombreUsuario NVARCHAR(100)
AS
BEGIN
    SELECT U.Id, U.NombreUsuario, U.PasswordHash, R.Nombre AS NombreRol, U.RolId
    FROM pt_Usuarios U
    INNER JOIN pt_Roles R ON U.RolId = R.Id
    WHERE U.NombreUsuario = @NombreUsuario AND U.Activo = 1;
END
GO

IF OBJECT_ID('sp_GestionarRoles', 'P') IS NOT NULL DROP PROCEDURE sp_GestionarRoles;
GO
CREATE PROCEDURE sp_GestionarRoles
    @Accion NVARCHAR(20),
    @Id INT = NULL,
    @Nombre NVARCHAR(100) = NULL,
    @Descripcion NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Accion = 'READ'
    BEGIN
        IF @Id IS NOT NULL SELECT * FROM pt_Roles WHERE Id = @Id;
        ELSE SELECT * FROM pt_Roles;
    END
END
GO
