ALTER PROCEDURE [dbo].[sp_GestionarUsuarios]
    @Accion NVARCHAR(10),
    @Id INT = NULL,
    @Nombre NVARCHAR(100) = NULL,
    @Email NVARCHAR(100) = NULL,
    @PasswordHash NVARCHAR(MAX) = NULL,
    @RolId INT = NULL
AS
BEGIN
    -- SELECT: Carga los usuarios y el nombre del rol asociado
    IF @Accion = 'SELECT'
    BEGIN
        SELECT
            u.Id,
            u.NombreUsuario,
            u.Email,
            u.PasswordHash,
            u.RolId,
            u.Activo,
            r.Nombre AS NombreRol
        FROM pt_Usuarios u
        LEFT JOIN pt_Roles r ON u.RolId = r.Id
    END

	-- INSERT CORREGIDO
	IF @Accion = 'INSERT'
	BEGIN
		INSERT INTO pt_Usuarios (NombreUsuario, Email, PasswordHash, RolId)
		VALUES (@Nombre, @Email, LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @PasswordHash), 2)), @RolId)
	END

	-- UPDATE CORREGIDO
	IF @Accion = 'UPDATE'
	BEGIN
		UPDATE pt_Usuarios
		SET NombreUsuario = @Nombre,
			Email = @Email,
			RolId = @RolId,
			PasswordHash = CASE
				WHEN @PasswordHash IS NOT NULL AND @PasswordHash <> ''
				THEN LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @PasswordHash), 2))
				ELSE PasswordHash
			END
		WHERE Id = @Id
	END

    -- DELETE
    IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_Usuarios WHERE Id = @Id
    END
END
