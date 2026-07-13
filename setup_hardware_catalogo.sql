IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_TiposHardware')
BEGIN
    CREATE TABLE Cat_TiposHardware (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(255) NOT NULL
    );
END
GO

IF OBJECT_ID('sp_GestionarTiposHardware', 'P') IS NOT NULL
    DROP PROCEDURE sp_GestionarTiposHardware;
GO

CREATE PROCEDURE sp_GestionarTiposHardware
    @Accion NVARCHAR(20),
    @Id INT = NULL,
    @Nombre NVARCHAR(255) = NULL
AS
BEGIN
    IF @Accion = 'SELECT'
    BEGIN
        IF @Id IS NOT NULL
            SELECT Id, Nombre FROM Cat_TiposHardware WHERE Id = @Id;
        ELSE
            SELECT Id, Nombre FROM Cat_TiposHardware ORDER BY Nombre;
    END

    IF @Accion = 'INSERT'
    BEGIN
        INSERT INTO Cat_TiposHardware (Nombre) VALUES (@Nombre);
    END

    IF @Accion = 'UPDATE'
    BEGIN
        UPDATE Cat_TiposHardware SET Nombre = @Nombre WHERE Id = @Id;
    END

    IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM Cat_TiposHardware WHERE Id = @Id;
    END
END
GO
