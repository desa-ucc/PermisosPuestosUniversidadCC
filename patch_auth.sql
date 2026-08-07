-- Añadir columnas a pt_Usuarios
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE Name = N'ResetToken' AND Object_ID = Object_ID(N'pt_Usuarios')
)
BEGIN
    ALTER TABLE pt_Usuarios ADD ResetToken NVARCHAR(256) NULL;
    ALTER TABLE pt_Usuarios ADD ResetTokenExpires DATETIME NULL;
END
GO

-- SP para generar token de reset
CREATE OR ALTER PROCEDURE sp_SetResetToken
    @Email NVARCHAR(150),
    @Token NVARCHAR(256),
    @Expires DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS(SELECT 1 FROM pt_Usuarios WHERE Email = @Email AND Activo = 1)
    BEGIN
        UPDATE pt_Usuarios
        SET ResetToken = @Token,
            ResetTokenExpires = @Expires
        WHERE Email = @Email;
        SELECT 1 AS Success;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success;
    END
END
GO

-- SP para resetear password con token
CREATE OR ALTER PROCEDURE sp_ResetPasswordWithToken
    @Token NVARCHAR(256),
    @NewPasswordHash NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS(SELECT 1 FROM pt_Usuarios WHERE ResetToken = @Token AND ResetTokenExpires > GETUTCDATE() AND Activo = 1)
    BEGIN
        UPDATE pt_Usuarios
        SET PasswordHash = LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @NewPasswordHash), 2)),
            ResetToken = NULL,
            ResetTokenExpires = NULL
        WHERE ResetToken = @Token;
        SELECT 1 AS Success;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success;
    END
END
GO

-- Añadir una vista temporal si necesitamos DTO simple de retorno
-- No hace falta, podemos usar un endpoint _context.Database.ExecuteSqlRawAsync
