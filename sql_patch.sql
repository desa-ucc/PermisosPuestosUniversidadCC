IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_AccesosBD')
BEGIN
    CREATE TABLE pt_AccesosBD (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES pt_Empleados(Id),
        Servidor NVARCHAR(150) NOT NULL,
        BaseDatos NVARCHAR(150) NOT NULL,
        NivelAcceso NVARCHAR(100) NOT NULL,
        Observaciones NVARCHAR(250) NULL
    );
END
GO

CREATE OR ALTER PROCEDURE sp_GestionarAccesosBD
    @Accion NVARCHAR(10),
    @Id INT = NULL,
    @EmpleadoId INT = NULL,
    @Servidor NVARCHAR(150) = NULL,
    @BaseDatos NVARCHAR(150) = NULL,
    @NivelAcceso NVARCHAR(100) = NULL,
    @Observaciones NVARCHAR(250) = NULL
AS
BEGIN
    IF @Accion = 'SELECT'
    BEGIN
        SELECT
            a.Id,
            a.EmpleadoId,
            e.NombreCompleto,
            p.CodigoPuesto,
            p.NombrePuesto,
            a.Servidor,
            a.BaseDatos,
            a.NivelAcceso,
            a.Observaciones
        FROM pt_AccesosBD a
        LEFT JOIN pt_Empleados e ON a.EmpleadoId = e.Id
        LEFT JOIN pt_Puestos p ON e.PuestoId = p.Id
    END

    IF @Accion = 'INSERT'
    BEGIN
        INSERT INTO pt_AccesosBD (EmpleadoId, Servidor, BaseDatos, NivelAcceso, Observaciones)
        VALUES (@EmpleadoId, @Servidor, @BaseDatos, @NivelAcceso, @Observaciones)
    END

    IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_AccesosBD
        SET EmpleadoId = @EmpleadoId,
            Servidor = @Servidor,
            BaseDatos = @BaseDatos,
            NivelAcceso = @NivelAcceso,
            Observaciones = @Observaciones
        WHERE Id = @Id
    END

    IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_AccesosBD WHERE Id = @Id
    END
END
GO
