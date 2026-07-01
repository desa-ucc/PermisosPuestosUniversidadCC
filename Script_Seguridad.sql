-- TABLAS

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Roles')
BEGIN
    CREATE TABLE pt_Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(250) NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Usuarios')
BEGIN
    CREATE TABLE pt_Usuarios (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        NombreUsuario NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        RolId INT NOT NULL FOREIGN KEY REFERENCES pt_Roles(Id),
        Activo BIT NOT NULL DEFAULT 1
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Permisos')
BEGIN
    CREATE TABLE pt_Permisos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoleId INT NOT NULL FOREIGN KEY REFERENCES pt_Roles(Id),
        PantallaId NVARCHAR(100) NOT NULL,
        PuedeCrear BIT NOT NULL DEFAULT 0,
        PuedeEditar BIT NOT NULL DEFAULT 0,
        PuedeEliminar BIT NOT NULL DEFAULT 0,
        PuedeVer BIT NOT NULL DEFAULT 0
    );
END
GO

-- STORED PROCEDURES

IF OBJECT_ID('sp_GestionarUsuarios', 'P') IS NOT NULL DROP PROCEDURE sp_GestionarUsuarios;
GO
CREATE PROCEDURE sp_GestionarUsuarios
    @Accion NVARCHAR(20), -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
    @Id INT = NULL,
    @NombreUsuario NVARCHAR(100) = NULL,
    @PasswordHash NVARCHAR(256) = NULL,
    @Email NVARCHAR(150) = NULL,
    @RolId INT = NULL,
    @Activo BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF @Accion = 'CREATE'
    BEGIN
        INSERT INTO pt_Usuarios (NombreUsuario, PasswordHash, Email, RolId, Activo)
        VALUES (@NombreUsuario, @PasswordHash, @Email, @RolId, @Activo);
        SELECT SCOPE_IDENTITY() AS Id;
    END
    ELSE IF @Accion = 'READ'
    BEGIN
        IF @Id IS NOT NULL
            SELECT * FROM pt_Usuarios WHERE Id = @Id;
        ELSE
            SELECT * FROM pt_Usuarios;
    END
    ELSE IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_Usuarios
        SET
            NombreUsuario = ISNULL(@NombreUsuario, NombreUsuario),
            PasswordHash = ISNULL(@PasswordHash, PasswordHash),
            Email = ISNULL(@Email, Email),
            RolId = ISNULL(@RolId, RolId),
            Activo = ISNULL(@Activo, Activo)
        WHERE Id = @Id;
    END
    ELSE IF @Accion = 'DELETE'
    BEGIN
        -- Logica soft delete o hard delete, asumimos hard delete si no tiene dependencias
        DELETE FROM pt_Usuarios WHERE Id = @Id;
    END
END
GO

IF OBJECT_ID('sp_GestionarPermisos', 'P') IS NOT NULL DROP PROCEDURE sp_GestionarPermisos;
GO
CREATE PROCEDURE sp_GestionarPermisos
    @Accion NVARCHAR(20), -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
    @Id INT = NULL,
    @RoleId INT = NULL,
    @PantallaId NVARCHAR(100) = NULL,
    @PuedeCrear BIT = 0,
    @PuedeEditar BIT = 0,
    @PuedeEliminar BIT = 0,
    @PuedeVer BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @Accion = 'CREATE'
    BEGIN
        INSERT INTO pt_Permisos (RoleId, PantallaId, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeVer)
        VALUES (@RoleId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer);
        SELECT SCOPE_IDENTITY() AS Id;
    END
    ELSE IF @Accion = 'READ'
    BEGIN
        IF @Id IS NOT NULL
            SELECT * FROM pt_Permisos WHERE Id = @Id;
        ELSE
            SELECT * FROM pt_Permisos;
    END
    ELSE IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_Permisos
        SET
            RoleId = ISNULL(@RoleId, RoleId),
            PantallaId = ISNULL(@PantallaId, PantallaId),
            PuedeCrear = ISNULL(@PuedeCrear, PuedeCrear),
            PuedeEditar = ISNULL(@PuedeEditar, PuedeEditar),
            PuedeEliminar = ISNULL(@PuedeEliminar, PuedeEliminar),
            PuedeVer = ISNULL(@PuedeVer, PuedeVer)
        WHERE Id = @Id;
    END
    ELSE IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_Permisos WHERE Id = @Id;
    END
END
GO


IF OBJECT_ID('sp_ObtenerPermisosPorRol', 'P') IS NOT NULL DROP PROCEDURE sp_ObtenerPermisosPorRol;
GO
CREATE PROCEDURE sp_ObtenerPermisosPorRol
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        RoleId,
        PantallaId,
        PuedeCrear,
        PuedeEditar,
        PuedeEliminar,
        PuedeVer
    FROM pt_Permisos
    WHERE RoleId = @RoleId;
END
GO
