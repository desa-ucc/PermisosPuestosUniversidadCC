IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'ProyectoPermisos')
BEGIN
    CREATE DATABASE ProyectoPermisos;
END
GO

USE ProyectoPermisos;
GO

-- A. SEGURIDAD
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(250) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        NombreUsuario NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(256) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        RolId INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
        Activo BIT NOT NULL DEFAULT 1
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permisos')
BEGIN
    CREATE TABLE Permisos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RolId INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
        Pantalla NVARCHAR(100) NOT NULL,
        CanRead BIT NOT NULL DEFAULT 1,
        CanWrite BIT NOT NULL DEFAULT 0,
        CanDelete BIT NOT NULL DEFAULT 0
    );
END

-- B. COLABORADORES Y PUESTOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Puestos')
BEGIN
    CREATE TABLE Puestos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CodigoPuesto NVARCHAR(50) NOT NULL UNIQUE,
        NombrePuesto NVARCHAR(150) NOT NULL,
        Descripcion NVARCHAR(250) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados')
BEGIN
    CREATE TABLE Empleados (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CodigoEmpleado NVARCHAR(50) NOT NULL UNIQUE,
        NombreCompleto NVARCHAR(250) NOT NULL,
        CorreoInstitucional NVARCHAR(150) NOT NULL,
        PuestoId INT NULL FOREIGN KEY REFERENCES Puestos(Id),
        FechaRegistro DATETIME NOT NULL DEFAULT GETDATE()
    );
END

-- C. INVENTARIO DE HARDWARE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HardwareIdeal')
BEGIN
    CREATE TABLE HardwareIdeal (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PuestoId INT NOT NULL FOREIGN KEY REFERENCES Puestos(Id),
        TipoEquipo NVARCHAR(100) NOT NULL,
        Procesador NVARCHAR(100) NOT NULL,
        Memoria NVARCHAR(50) NOT NULL,
        Disco NVARCHAR(50) NOT NULL,
        MarcaPC NVARCHAR(100) NOT NULL,
        TecladoNumerico BIT NOT NULL,
        OtrasConsideraciones NVARCHAR(MAX)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HardwareAsignado')
BEGIN
    CREATE TABLE HardwareAsignado (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES Empleados(Id),
        TipoEquipo NVARCHAR(100) NOT NULL,
        Procesador NVARCHAR(100) NOT NULL,
        Memoria NVARCHAR(50) NOT NULL,
        Disco NVARCHAR(50) NOT NULL,
        MarcaPC NVARCHAR(100) NOT NULL,
        TecladoNumerico BIT NOT NULL,
        OtrasConsideraciones NVARCHAR(MAX),
        Placa NVARCHAR(100) NOT NULL UNIQUE
    );
END

-- D. SOFTWARE Y ACCESOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SoftwareLocal')
BEGIN
    CREATE TABLE SoftwareLocal (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES Empleados(Id),
        Equipo NVARCHAR(100) NOT NULL,
        GruposAD NVARCHAR(250) NOT NULL,
        NombreSoftware NVARCHAR(150) NOT NULL,
        Version NVARCHAR(50) NOT NULL,
        Fabricante NVARCHAR(100) NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PermisosSitio')
BEGIN
    CREATE TABLE PermisosSitio (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES Empleados(Id),
        Sitio NVARCHAR(150) NOT NULL,
        Ambiente NVARCHAR(100) NOT NULL,
        GruposPermisos NVARCHAR(250) NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Plataformas')
BEGIN
    CREATE TABLE Plataformas (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES Empleados(Id),
        NombrePlataforma NVARCHAR(150) NOT NULL,
        Licencias NVARCHAR(100) NOT NULL,
        Modulos NVARCHAR(250) NOT NULL,
        AccesosPermisos NVARCHAR(250) NOT NULL,
        NivelAcceso NVARCHAR(100) NOT NULL
    );
END

-- SEMILLA DE USUARIO ADMINISTRADOR
IF NOT EXISTS (SELECT * FROM Roles WHERE Nombre = 'Admin')
BEGIN
    INSERT INTO Roles (Nombre, Descripcion) VALUES ('Admin', 'Administrador Global');
END

IF NOT EXISTS (SELECT * FROM Usuarios WHERE NombreUsuario = 'admin')
BEGIN
    DECLARE @RolId INT;
    SELECT @RolId = Id FROM Roles WHERE Nombre = 'Admin';
    -- SHA256 de 'admin123'
    INSERT INTO Usuarios (NombreUsuario, PasswordHash, Email, RolId, Activo)
    VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@ucc.edu', @RolId, 1);
END
GO

-- STORED PROCEDURES (CRUD COMPLETO)

-- Seguridad (Auth)
IF OBJECT_ID('sp_Login', 'P') IS NOT NULL DROP PROCEDURE sp_Login;
GO
CREATE PROCEDURE sp_Login
    @NombreUsuario NVARCHAR(100)
AS
BEGIN
    SELECT U.Id, U.NombreUsuario, U.PasswordHash, R.Nombre AS NombreRol
    FROM Usuarios U
    INNER JOIN Roles R ON U.RolId = R.Id
    WHERE U.NombreUsuario = @NombreUsuario AND U.Activo = 1;
END
GO

-- Puestos CRUD
IF OBJECT_ID('sp_GetPuestos', 'P') IS NOT NULL DROP PROCEDURE sp_GetPuestos;
GO
CREATE PROCEDURE sp_GetPuestos AS BEGIN SELECT * FROM Puestos END;
GO

IF OBJECT_ID('sp_CreatePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePuesto;
GO
CREATE PROCEDURE sp_CreatePuesto @CodigoPuesto NVARCHAR(50), @NombrePuesto NVARCHAR(150), @Descripcion NVARCHAR(250) AS
BEGIN
    INSERT INTO Puestos (CodigoPuesto, NombrePuesto, Descripcion) VALUES (@CodigoPuesto, @NombrePuesto, @Descripcion);
END;
GO

IF OBJECT_ID('sp_UpdatePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_UpdatePuesto;
GO
CREATE PROCEDURE sp_UpdatePuesto @Id INT, @CodigoPuesto NVARCHAR(50), @NombrePuesto NVARCHAR(150), @Descripcion NVARCHAR(250) AS
BEGIN
    UPDATE Puestos SET CodigoPuesto = @CodigoPuesto, NombrePuesto = @NombrePuesto, Descripcion=@Descripcion WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeletePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_DeletePuesto;
GO
CREATE PROCEDURE sp_DeletePuesto @Id INT AS BEGIN DELETE FROM Puestos WHERE Id = @Id; END;
GO

-- Empleados CRUD
IF OBJECT_ID('sp_GetEmpleados', 'P') IS NOT NULL DROP PROCEDURE sp_GetEmpleados;
GO
CREATE PROCEDURE sp_GetEmpleados AS
BEGIN
    SELECT E.*, P.NombrePuesto FROM Empleados E LEFT JOIN Puestos P ON E.PuestoId = P.Id
END;
GO

IF OBJECT_ID('sp_CreateEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_CreateEmpleado;
GO
CREATE PROCEDURE sp_CreateEmpleado @CodigoEmpleado NVARCHAR(50), @NombreCompleto NVARCHAR(250), @CorreoInstitucional NVARCHAR(150), @PuestoId INT AS
BEGIN
    INSERT INTO Empleados (CodigoEmpleado, NombreCompleto, CorreoInstitucional, PuestoId) VALUES (@CodigoEmpleado, @NombreCompleto, @CorreoInstitucional, @PuestoId);
END;
GO

IF OBJECT_ID('sp_UpdateEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateEmpleado;
GO
CREATE PROCEDURE sp_UpdateEmpleado @Id INT, @CodigoEmpleado NVARCHAR(50), @NombreCompleto NVARCHAR(250), @CorreoInstitucional NVARCHAR(150), @PuestoId INT AS
BEGIN
    UPDATE Empleados SET CodigoEmpleado = @CodigoEmpleado, NombreCompleto = @NombreCompleto, CorreoInstitucional = @CorreoInstitucional, PuestoId = @PuestoId WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeleteEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteEmpleado;
GO
CREATE PROCEDURE sp_DeleteEmpleado @Id INT AS BEGIN DELETE FROM Empleados WHERE Id = @Id; END;
GO

-- HardwareIdeal CRUD
IF OBJECT_ID('sp_GetHardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_GetHardwareIdeal;
GO
CREATE PROCEDURE sp_GetHardwareIdeal AS BEGIN SELECT * FROM HardwareIdeal END;
GO

IF OBJECT_ID('sp_InsertHardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_InsertHardwareIdeal;
GO
CREATE PROCEDURE sp_InsertHardwareIdeal @PuestoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100), @TecladoNumerico BIT, @OtrasConsideraciones NVARCHAR(MAX) AS
BEGIN
    INSERT INTO HardwareIdeal (PuestoId, TipoEquipo, Procesador, Memoria, Disco, MarcaPC, TecladoNumerico, OtrasConsideraciones)
    VALUES (@PuestoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones);
END;
GO

IF OBJECT_ID('sp_UpdateHardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateHardwareIdeal;
GO
CREATE PROCEDURE sp_UpdateHardwareIdeal @Id INT, @PuestoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100), @TecladoNumerico BIT, @OtrasConsideraciones NVARCHAR(MAX) AS
BEGIN
    UPDATE HardwareIdeal SET PuestoId=@PuestoId, TipoEquipo=@TipoEquipo, Procesador=@Procesador, Memoria=@Memoria, Disco=@Disco, MarcaPC=@MarcaPC, TecladoNumerico=@TecladoNumerico, OtrasConsideraciones=@OtrasConsideraciones WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeleteHardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteHardwareIdeal;
GO
CREATE PROCEDURE sp_DeleteHardwareIdeal @Id INT AS BEGIN DELETE FROM HardwareIdeal WHERE Id = @Id; END;
GO

-- HardwareAsignado CRUD
IF OBJECT_ID('sp_GetHardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_GetHardwareAsignado;
GO
CREATE PROCEDURE sp_GetHardwareAsignado AS BEGIN SELECT * FROM HardwareAsignado END;
GO

IF OBJECT_ID('sp_CreateHardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_CreateHardwareAsignado;
GO
CREATE PROCEDURE sp_CreateHardwareAsignado @EmpleadoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100), @TecladoNumerico BIT, @OtrasConsideraciones NVARCHAR(MAX), @Placa NVARCHAR(100) AS
BEGIN
    INSERT INTO HardwareAsignado (EmpleadoId, TipoEquipo, Procesador, Memoria, Disco, MarcaPC, TecladoNumerico, OtrasConsideraciones, Placa)
    VALUES (@EmpleadoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones, @Placa);
END;
GO

IF OBJECT_ID('sp_UpdateHardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateHardwareAsignado;
GO
CREATE PROCEDURE sp_UpdateHardwareAsignado @Id INT, @EmpleadoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100), @TecladoNumerico BIT, @OtrasConsideraciones NVARCHAR(MAX), @Placa NVARCHAR(100) AS
BEGIN
    UPDATE HardwareAsignado SET EmpleadoId=@EmpleadoId, TipoEquipo=@TipoEquipo, Procesador=@Procesador, Memoria=@Memoria, Disco=@Disco, MarcaPC=@MarcaPC, TecladoNumerico=@TecladoNumerico, OtrasConsideraciones=@OtrasConsideraciones, Placa=@Placa WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeleteHardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteHardwareAsignado;
GO
CREATE PROCEDURE sp_DeleteHardwareAsignado @Id INT AS BEGIN DELETE FROM HardwareAsignado WHERE Id = @Id; END;
GO

-- SoftwareLocal CRUD
IF OBJECT_ID('sp_GetSoftwareLocales', 'P') IS NOT NULL DROP PROCEDURE sp_GetSoftwareLocales;
GO
CREATE PROCEDURE sp_GetSoftwareLocales AS BEGIN SELECT * FROM SoftwareLocal END;
GO

IF OBJECT_ID('sp_CreateSoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_CreateSoftwareLocal;
GO
CREATE PROCEDURE sp_CreateSoftwareLocal @EmpleadoId INT, @Equipo NVARCHAR(100), @GruposAD NVARCHAR(250), @NombreSoftware NVARCHAR(150), @Version NVARCHAR(50), @Fabricante NVARCHAR(100) AS
BEGIN
    INSERT INTO SoftwareLocal (EmpleadoId, Equipo, GruposAD, NombreSoftware, Version, Fabricante) VALUES (@EmpleadoId, @Equipo, @GruposAD, @NombreSoftware, @Version, @Fabricante);
END;
GO

IF OBJECT_ID('sp_UpdateSoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateSoftwareLocal;
GO
CREATE PROCEDURE sp_UpdateSoftwareLocal @Id INT, @EmpleadoId INT, @Equipo NVARCHAR(100), @GruposAD NVARCHAR(250), @NombreSoftware NVARCHAR(150), @Version NVARCHAR(50), @Fabricante NVARCHAR(100) AS
BEGIN
    UPDATE SoftwareLocal SET EmpleadoId=@EmpleadoId, Equipo=@Equipo, GruposAD=@GruposAD, NombreSoftware=@NombreSoftware, Version=@Version, Fabricante=@Fabricante WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeleteSoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteSoftwareLocal;
GO
CREATE PROCEDURE sp_DeleteSoftwareLocal @Id INT AS BEGIN DELETE FROM SoftwareLocal WHERE Id = @Id; END;
GO

-- PermisosSitio CRUD
IF OBJECT_ID('sp_GetPermisosSitios', 'P') IS NOT NULL DROP PROCEDURE sp_GetPermisosSitios;
GO
CREATE PROCEDURE sp_GetPermisosSitios AS BEGIN SELECT * FROM PermisosSitio END;
GO

IF OBJECT_ID('sp_CreatePermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePermisosSitio;
GO
CREATE PROCEDURE sp_CreatePermisosSitio @EmpleadoId INT, @Sitio NVARCHAR(150), @Ambiente NVARCHAR(100), @GruposPermisos NVARCHAR(250) AS
BEGIN
    INSERT INTO PermisosSitio (EmpleadoId, Sitio, Ambiente, GruposPermisos) VALUES (@EmpleadoId, @Sitio, @Ambiente, @GruposPermisos);
END;
GO

IF OBJECT_ID('sp_UpdatePermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_UpdatePermisosSitio;
GO
CREATE PROCEDURE sp_UpdatePermisosSitio @Id INT, @EmpleadoId INT, @Sitio NVARCHAR(150), @Ambiente NVARCHAR(100), @GruposPermisos NVARCHAR(250) AS
BEGIN
    UPDATE PermisosSitio SET EmpleadoId=@EmpleadoId, Sitio=@Sitio, Ambiente=@Ambiente, GruposPermisos=@GruposPermisos WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeletePermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_DeletePermisosSitio;
GO
CREATE PROCEDURE sp_DeletePermisosSitio @Id INT AS BEGIN DELETE FROM PermisosSitio WHERE Id = @Id; END;
GO

-- Plataformas CRUD
IF OBJECT_ID('sp_GetPlataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetPlataformas;
GO
CREATE PROCEDURE sp_GetPlataformas AS BEGIN SELECT * FROM Plataformas END;
GO

IF OBJECT_ID('sp_CreatePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePlataforma;
GO
CREATE PROCEDURE sp_CreatePlataforma @EmpleadoId INT, @NombrePlataforma NVARCHAR(150), @Licencias NVARCHAR(100), @Modulos NVARCHAR(250), @AccesosPermisos NVARCHAR(250), @NivelAcceso NVARCHAR(100) AS
BEGIN
    INSERT INTO Plataformas (EmpleadoId, NombrePlataforma, Licencias, Modulos, AccesosPermisos, NivelAcceso) VALUES (@EmpleadoId, @NombrePlataforma, @Licencias, @Modulos, @AccesosPermisos, @NivelAcceso);
END;
GO

IF OBJECT_ID('sp_UpdatePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_UpdatePlataforma;
GO
CREATE PROCEDURE sp_UpdatePlataforma @Id INT, @EmpleadoId INT, @NombrePlataforma NVARCHAR(150), @Licencias NVARCHAR(100), @Modulos NVARCHAR(250), @AccesosPermisos NVARCHAR(250), @NivelAcceso NVARCHAR(100) AS
BEGIN
    UPDATE Plataformas SET EmpleadoId=@EmpleadoId, NombrePlataforma=@NombrePlataforma, Licencias=@Licencias, Modulos=@Modulos, AccesosPermisos=@AccesosPermisos, NivelAcceso=@NivelAcceso WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeletePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_DeletePlataforma;
GO
CREATE PROCEDURE sp_DeletePlataforma @Id INT AS BEGIN DELETE FROM Plataformas WHERE Id = @Id; END;
GO

-- E. CATÁLOGOS BASE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_Ambientes')
BEGIN
    CREATE TABLE Cat_Ambientes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_Sitios')
BEGIN
    CREATE TABLE Cat_Sitios (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_Plataformas')
BEGIN
    CREATE TABLE Cat_Plataformas (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL UNIQUE
    );
END

-- DATOS SEMILLA PARA CATÁLOGOS
IF NOT EXISTS (SELECT * FROM Cat_Ambientes)
BEGIN
    INSERT INTO Cat_Ambientes (Nombre) VALUES ('Producción'), ('Pruebas'), ('Desarrollo');
END

IF NOT EXISTS (SELECT * FROM Cat_Sitios)
BEGIN
    INSERT INTO Cat_Sitios (Nombre) VALUES ('Avatar'), ('Intranet'), ('SharePoint');
END

IF NOT EXISTS (SELECT * FROM Cat_Plataformas)
BEGIN
    INSERT INTO Cat_Plataformas (Nombre) VALUES ('Moodle'), ('Office 365'), ('Azure'), ('AWS');
END

-- SPs PARA CATÁLOGOS
-- Cat_Ambientes
IF OBJECT_ID('sp_GetCatAmbientes', 'P') IS NOT NULL DROP PROCEDURE sp_GetCatAmbientes;
GO
CREATE PROCEDURE sp_GetCatAmbientes AS BEGIN SELECT * FROM Cat_Ambientes END;
GO
IF OBJECT_ID('sp_CreateCatAmbiente', 'P') IS NOT NULL DROP PROCEDURE sp_CreateCatAmbiente;
GO
CREATE PROCEDURE sp_CreateCatAmbiente @Nombre NVARCHAR(100) AS BEGIN INSERT INTO Cat_Ambientes (Nombre) VALUES (@Nombre); END;
GO
IF OBJECT_ID('sp_DeleteCatAmbiente', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteCatAmbiente;
GO
CREATE PROCEDURE sp_DeleteCatAmbiente @Id INT AS BEGIN DELETE FROM Cat_Ambientes WHERE Id = @Id; END;
GO

-- Cat_Sitios
IF OBJECT_ID('sp_GetCatSitios', 'P') IS NOT NULL DROP PROCEDURE sp_GetCatSitios;
GO
CREATE PROCEDURE sp_GetCatSitios AS BEGIN SELECT * FROM Cat_Sitios END;
GO
IF OBJECT_ID('sp_CreateCatSitio', 'P') IS NOT NULL DROP PROCEDURE sp_CreateCatSitio;
GO
CREATE PROCEDURE sp_CreateCatSitio @Nombre NVARCHAR(150) AS BEGIN INSERT INTO Cat_Sitios (Nombre) VALUES (@Nombre); END;
GO
IF OBJECT_ID('sp_DeleteCatSitio', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteCatSitio;
GO
CREATE PROCEDURE sp_DeleteCatSitio @Id INT AS BEGIN DELETE FROM Cat_Sitios WHERE Id = @Id; END;
GO

-- Cat_Plataformas
IF OBJECT_ID('sp_GetCatPlataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetCatPlataformas;
GO
CREATE PROCEDURE sp_GetCatPlataformas AS BEGIN SELECT * FROM Cat_Plataformas END;
GO
IF OBJECT_ID('sp_CreateCatPlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_CreateCatPlataforma;
GO
CREATE PROCEDURE sp_CreateCatPlataforma @Nombre NVARCHAR(150) AS BEGIN INSERT INTO Cat_Plataformas (Nombre) VALUES (@Nombre); END;
GO
IF OBJECT_ID('sp_DeleteCatPlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteCatPlataforma;
GO
CREATE PROCEDURE sp_DeleteCatPlataforma @Id INT AS BEGIN DELETE FROM Cat_Plataformas WHERE Id = @Id; END;
GO


-- NUEVOS CATÁLOGOS BASE SOLICITADOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_NivelesAcceso')
BEGIN
    CREATE TABLE Cat_NivelesAcceso (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_PlataformasNombres')
BEGIN
    CREATE TABLE Cat_PlataformasNombres (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_TiposLicencia')
BEGIN
    CREATE TABLE Cat_TiposLicencia (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END

-- DATOS SEMILLA
IF NOT EXISTS (SELECT * FROM Cat_NivelesAcceso)
BEGIN
    INSERT INTO Cat_NivelesAcceso (Nombre) VALUES ('Administrador'), ('Usuario'), ('Consulta');
END

IF NOT EXISTS (SELECT * FROM Cat_PlataformasNombres)
BEGIN
    INSERT INTO Cat_PlataformasNombres (Nombre) VALUES ('Microsoft Visual Studio'), ('SQL Server Management Studio'), ('Office 365'), ('Moodle'), ('Avatar Producción');
END

IF NOT EXISTS (SELECT * FROM Cat_TiposLicencia)
BEGIN
    INSERT INTO Cat_TiposLicencia (Nombre) VALUES ('Posee'), ('No tiene');
END

-- STORED PROCEDURES (SOLO LECTURA SOLICITADA)
IF OBJECT_ID('sp_GetNivelesAcceso', 'P') IS NOT NULL DROP PROCEDURE sp_GetNivelesAcceso;
GO
CREATE PROCEDURE sp_GetNivelesAcceso AS BEGIN SELECT * FROM Cat_NivelesAcceso END;
GO

IF OBJECT_ID('sp_GetPlataformasNombres', 'P') IS NOT NULL DROP PROCEDURE sp_GetPlataformasNombres;
GO
CREATE PROCEDURE sp_GetPlataformasNombres AS BEGIN SELECT * FROM Cat_PlataformasNombres END;
GO

IF OBJECT_ID('sp_GetTiposLicencia', 'P') IS NOT NULL DROP PROCEDURE sp_GetTiposLicencia;
GO
CREATE PROCEDURE sp_GetTiposLicencia AS BEGIN SELECT * FROM Cat_TiposLicencia END;
GO


-- SP: GENERACIÓN DE REPORTES POR PERFIL (PUESTO)
IF OBJECT_ID('sp_GetReportePerfilTecnologico', 'P') IS NOT NULL DROP PROCEDURE sp_GetReportePerfilTecnologico;
GO
CREATE PROCEDURE sp_GetReportePerfilTecnologico
    @CodigoPerfil VARCHAR(50)
AS
BEGIN
    SELECT
        E.CodigoEmpleado,
        E.NombreCompleto AS Empleado,
        P.NombrePuesto AS Perfil,
        ISNULL(H.TipoEquipo, 'N/A') AS Equipo,
        ISNULL(H.Placa, 'N/A') AS PlacaEquipo,
        ISNULL(S.NombreSoftware, 'N/A') AS Software,
        ISNULL(S.Version, '') AS VersionSoftware,
        ISNULL(Pl.NombrePlataforma, 'N/A') AS Plataforma,
        ISNULL(Pl.Licencias, 'N/A') AS EstadoLicencia,
        -- Dummy columns for the exact requirement of demonstrating currency export later in Angular
        1500.00 AS CostoEstimadoHardware,
        299.99 AS CostoEstimadoLicencias
    FROM Empleados E
    INNER JOIN Puestos P ON E.PuestoId = P.Id
    LEFT JOIN HardwareAsignado H ON H.EmpleadoId = E.Id
    LEFT JOIN SoftwareLocal S ON S.EmpleadoId = E.Id
    LEFT JOIN Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE P.CodigoPuesto = @CodigoPerfil;
END
GO

-- SP: GENERACIÓN DE REPORTES INTEGRAL
IF OBJECT_ID('sp_GetReporteIntegralHardware', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralHardware;
GO
CREATE PROCEDURE sp_GetReporteIntegralHardware
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        P.NombrePuesto AS Puesto,
        E.NombreCompleto AS Nombre,
        H.TipoEquipo AS Equipo,
        H.Procesador,
        H.Memoria,
        H.Disco,
        H.MarcaPC,
        H.TecladoNumerico,
        H.OtrasConsideraciones
    FROM Empleados E
    INNER JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN HardwareAsignado H ON H.EmpleadoId = E.Id
    WHERE P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%';
END
GO

IF OBJECT_ID('sp_GetReporteIntegralSitios', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralSitios;
GO
CREATE PROCEDURE sp_GetReporteIntegralSitios
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        P.NombrePuesto AS Puesto,
        E.NombreCompleto AS Nombre,
        S.Sitio,
        S.Ambiente,
        S.GruposPermisos
    FROM Empleados E
    INNER JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%';
END
GO

IF OBJECT_ID('sp_GetReporteIntegralPlataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralPlataformas;
GO
CREATE PROCEDURE sp_GetReporteIntegralPlataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        P.NombrePuesto AS Puesto,
        E.NombreCompleto AS Nombre,
        Pl.Licencias,
        Pl.NombrePlataforma AS Plataformas,
        Pl.Modulos,
        Pl.AccesosPermisos AS AccesosYPermisos,
        Pl.NivelAcceso
    FROM Empleados E
    INNER JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%';
END
GO

-- CREACIÓN DE STORED PROCEDURES DE REPORTE INTEGRAL
IF OBJECT_ID('sp_GetReporteIntegralHardware', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralHardware;
GO
CREATE PROCEDURE sp_GetReporteIntegralHardware
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        H.TipoEquipo AS Equipo,
        H.Procesador,
        H.Memoria,
        H.Disco,
        H.MarcaPC,
        H.TecladoNumerico,
        ISNULL(H.OtrasConsideraciones, '') AS OtrasConsideraciones
    FROM Empleados E
    LEFT JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN HardwareAsignado H ON H.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

IF OBJECT_ID('sp_GetReporteIntegralSitios', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralSitios;
GO
CREATE PROCEDURE sp_GetReporteIntegralSitios
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        S.Sitio,
        S.Ambiente,
        S.GruposPermisos
    FROM Empleados E
    LEFT JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

IF OBJECT_ID('sp_GetReporteIntegralPlataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralPlataformas;
GO
CREATE PROCEDURE sp_GetReporteIntegralPlataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        Pl.Licencias,
        Pl.NombrePlataforma AS Plataformas,
        Pl.Modulos,
        Pl.AccesosPermisos AS AccesosYPermisos,
        Pl.NivelAcceso
    FROM Empleados E
    LEFT JOIN Puestos P ON E.PuestoId = P.Id
    INNER JOIN Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO
