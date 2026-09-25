-- =========================================================================================
-- VISTA: v_AuthUsuarios
-- Propósito: Obtener información del usuario con su rol asociado para procesos de autenticación
-- =========================================================================================
CREATE OR ALTER VIEW v_AuthUsuarios AS
SELECT
    u.Id,
    u.NombreUsuario,
    u.PasswordHash,
    u.Email,
    u.RolId,
    r.Nombre AS NombreRol,
    u.Activo
FROM pt_Usuarios u
INNER JOIN pt_Roles r ON u.RolId = r.Id;
GO

-- =========================================================================================
-- VISTA: v_ValidacionUsuarioRecuperacion
-- Propósito: Validar si un usuario existe y está activo para iniciar la recuperación de contraseña
-- =========================================================================================
CREATE OR ALTER VIEW v_ValidacionUsuarioRecuperacion AS
SELECT
    Email,
    NombreUsuario,
    Activo
FROM pt_Usuarios;
GO

-- =========================================================================================
-- PROCEDIMIENTO ALMACENADO: sp_GenerarTokenRecuperacion
-- Propósito: Asignar un token y una fecha de expiración a un usuario para recuperación de contraseña
-- =========================================================================================
CREATE OR ALTER PROCEDURE sp_GenerarTokenRecuperacion
    @Email NVARCHAR(255),
    @Token NVARCHAR(255),
    @ExpiracionToken DATETIME
AS
BEGIN
    UPDATE pt_Usuarios
    SET TokenRecuperacion = @Token,
        ExpiracionToken = @ExpiracionToken
    WHERE Email = @Email;
END;
GO

-- =========================================================================================
-- PROCEDIMIENTO ALMACENADO: sp_RestablecerPassword
-- Propósito: Actualizar la contraseña de un usuario si el token es válido y no ha expirado
-- =========================================================================================
CREATE OR ALTER PROCEDURE sp_RestablecerPassword
    @Token NVARCHAR(255),
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    UPDATE pt_Usuarios
    SET PasswordHash = @NewPasswordHash,
        TokenRecuperacion = NULL,
        ExpiracionToken = NULL
    WHERE TokenRecuperacion = @Token AND ExpiracionToken > GETUTCDATE();

    -- Devuelve el número de filas afectadas para que C# sepa si el token era válido
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;
GO
