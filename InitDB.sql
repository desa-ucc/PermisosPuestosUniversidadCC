IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'pt_Proyectopt_Permisos')
BEGIN
    CREATE DATABASE Proyectopt_Permisos;
END
GO

USE Proyectopt_Permisos;
GO

-- A. SEGURIDAD
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Roles')
BEGIN
    CREATE TABLE pt_Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(250) NULL
    );
END

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Permisos')
BEGIN
    CREATE TABLE pt_Permisos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RolId INT NOT NULL FOREIGN KEY REFERENCES pt_Roles(Id),
        Pantalla NVARCHAR(100) NOT NULL,
        CanRead BIT NOT NULL DEFAULT 1,
        CanWrite BIT NOT NULL DEFAULT 0,
        CanDelete BIT NOT NULL DEFAULT 0
    );
END

-- B. COLABORADORES Y pt_Puestos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Puestos')
BEGIN
    CREATE TABLE pt_Puestos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CodigoPuesto NVARCHAR(50) NOT NULL UNIQUE,
        NombrePuesto NVARCHAR(150) NOT NULL,
        Descripcion NVARCHAR(250) NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Empleados')
BEGIN
    CREATE TABLE pt_Empleados (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CodigoEmpleado NVARCHAR(50) NOT NULL UNIQUE,
        NombreCompleto NVARCHAR(250) NOT NULL,
        CorreoInstitucional NVARCHAR(150) NOT NULL,
        PuestoId INT NULL FOREIGN KEY REFERENCES pt_Puestos(Id),
        FechaRegistro DATETIME NOT NULL DEFAULT GETDATE()
    );
END

-- C. INVENTARIO DE HARDWARE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_HardwareIdeal')
BEGIN
    CREATE TABLE pt_HardwareIdeal (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PuestoId INT NOT NULL FOREIGN KEY REFERENCES pt_Puestos(Id),
        TipoEquipo NVARCHAR(100) NOT NULL,
        Procesador NVARCHAR(100) NOT NULL,
        Memoria NVARCHAR(50) NOT NULL,
        Disco NVARCHAR(50) NOT NULL,
        MarcaPC NVARCHAR(100) NOT NULL,
        OtrasConsideraciones NVARCHAR(MAX)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_HardwareAsignado')
BEGIN
    CREATE TABLE pt_HardwareAsignado (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES pt_Empleados(Id),
        TipoEquipo NVARCHAR(100) NOT NULL,
        Procesador NVARCHAR(100) NOT NULL,
        Memoria NVARCHAR(50) NOT NULL,
        Disco NVARCHAR(50) NOT NULL,
        MarcaPC NVARCHAR(100) NOT NULL,
        OtrasConsideraciones NVARCHAR(MAX),
        Placa NVARCHAR(100) NOT NULL UNIQUE
    );
END

-- D. SOFTWARE Y ACCESOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_SoftwareLocal')
BEGIN
    CREATE TABLE pt_SoftwareLocal (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES pt_Empleados(Id),
        Equipo NVARCHAR(100) NOT NULL,
        GruposAD NVARCHAR(250) NOT NULL,
        NombreSoftware NVARCHAR(150) NOT NULL,
        Version NVARCHAR(50) NOT NULL,
        Fabricante NVARCHAR(100) NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_PermisosSitio')
BEGIN
    CREATE TABLE pt_PermisosSitio (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES pt_Empleados(Id),
        Sitio NVARCHAR(150) NOT NULL,
        Ambiente NVARCHAR(100) NOT NULL,
        Grupospt_Permisos NVARCHAR(250) NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pt_Plataformas')
BEGIN
    CREATE TABLE pt_Plataformas (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmpleadoId INT NOT NULL FOREIGN KEY REFERENCES pt_Empleados(Id),
        NombrePlataforma NVARCHAR(150) NOT NULL,
        Licencias NVARCHAR(100) NOT NULL,
        Modulos NVARCHAR(250) NOT NULL,
        Accesospt_Permisos NVARCHAR(250) NOT NULL,
        NivelAcceso NVARCHAR(100) NOT NULL
    );
END

-- SEMILLA DE USUARIO ADMINISTRADOR
IF NOT EXISTS (SELECT * FROM pt_Roles WHERE Nombre = 'Admin')
BEGIN
    INSERT INTO pt_Roles (Nombre, Descripcion) VALUES ('Admin', 'Administrador Global');
END

IF NOT EXISTS (SELECT * FROM pt_Usuarios WHERE NombreUsuario = 'admin')
BEGIN
    DECLARE @RolId INT;
    SELECT @RolId = Id FROM pt_Roles WHERE Nombre = 'Admin';
    -- SHA256 de 'admin123'
    INSERT INTO pt_Usuarios (NombreUsuario, PasswordHash, Email, RolId, Activo)
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
    FROM pt_Usuarios U
    INNER JOIN pt_Roles R ON U.RolId = R.Id
    WHERE U.NombreUsuario = @NombreUsuario AND U.Activo = 1;
END
GO

-- pt_Puestos CRUD
IF OBJECT_ID('sp_Getpt_Puestos', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_Puestos;
GO
CREATE PROCEDURE sp_Getpt_Puestos AS BEGIN SELECT * FROM pt_Puestos END;
GO

IF OBJECT_ID('sp_CreatePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePuesto;
GO
CREATE PROCEDURE sp_CreatePuesto @CodigoPuesto NVARCHAR(50), @NombrePuesto NVARCHAR(150), @Descripcion NVARCHAR(250) AS
BEGIN
    INSERT INTO pt_Puestos (CodigoPuesto, NombrePuesto, Descripcion) VALUES (@CodigoPuesto, @NombrePuesto, @Descripcion);
END;
GO

IF OBJECT_ID('sp_UpdatePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_UpdatePuesto;
GO
CREATE PROCEDURE sp_UpdatePuesto @Id INT, @CodigoPuesto NVARCHAR(50), @NombrePuesto NVARCHAR(150), @Descripcion NVARCHAR(250) AS
BEGIN
    UPDATE pt_Puestos SET CodigoPuesto = @CodigoPuesto, NombrePuesto = @NombrePuesto, Descripcion=@Descripcion WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeletePuesto', 'P') IS NOT NULL DROP PROCEDURE sp_DeletePuesto;
GO
CREATE PROCEDURE sp_DeletePuesto @Id INT AS BEGIN DELETE FROM pt_Puestos WHERE Id = @Id; END;
GO

-- pt_Empleados CRUD
IF OBJECT_ID('sp_Getpt_Empleados', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_Empleados;
GO
CREATE PROCEDURE sp_Getpt_Empleados AS
BEGIN
    SELECT E.*, P.NombrePuesto FROM pt_Empleados E LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
END;
GO

IF OBJECT_ID('sp_CreateEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_CreateEmpleado;
GO
CREATE PROCEDURE sp_CreateEmpleado @CodigoEmpleado NVARCHAR(50), @NombreCompleto NVARCHAR(250), @CorreoInstitucional NVARCHAR(150), @PuestoId INT AS
BEGIN
    INSERT INTO pt_Empleados (CodigoEmpleado, NombreCompleto, CorreoInstitucional, PuestoId) VALUES (@CodigoEmpleado, @NombreCompleto, @CorreoInstitucional, @PuestoId);
END;
GO

IF OBJECT_ID('sp_UpdateEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateEmpleado;
GO
CREATE PROCEDURE sp_UpdateEmpleado @Id INT, @CodigoEmpleado NVARCHAR(50), @NombreCompleto NVARCHAR(250), @CorreoInstitucional NVARCHAR(150), @PuestoId INT AS
BEGIN
    UPDATE pt_Empleados SET CodigoEmpleado = @CodigoEmpleado, NombreCompleto = @NombreCompleto, CorreoInstitucional = @CorreoInstitucional, PuestoId = @PuestoId WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeleteEmpleado', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteEmpleado;
GO
CREATE PROCEDURE sp_DeleteEmpleado @Id INT AS BEGIN DELETE FROM pt_Empleados WHERE Id = @Id; END;
GO

-- pt_HardwareIdeal CRUD
IF OBJECT_ID('sp_Getpt_HardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_HardwareIdeal;
GO
CREATE PROCEDURE sp_Getpt_HardwareIdeal AS BEGIN SELECT * FROM pt_HardwareIdeal END;
GO

IF OBJECT_ID('sp_Insertpt_HardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_Insertpt_HardwareIdeal;
GO
CREATE PROCEDURE sp_Insertpt_HardwareIdeal @PuestoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100),  @OtrasConsideraciones NVARCHAR(MAX) AS
BEGIN
    INSERT INTO pt_HardwareIdeal (PuestoId, TipoEquipo, Procesador, Memoria, Disco, MarcaPC, OtrasConsideraciones)
    VALUES (@PuestoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones);
END;
GO

IF OBJECT_ID('sp_Updatept_HardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_Updatept_HardwareIdeal;
GO
CREATE PROCEDURE sp_Updatept_HardwareIdeal @Id INT, @PuestoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100), @OtrasConsideraciones NVARCHAR(MAX) AS
BEGIN
    UPDATE pt_HardwareIdeal SET PuestoId=@PuestoId, TipoEquipo=@TipoEquipo, Procesador=@Procesador, Memoria=@Memoria, Disco=@Disco, MarcaPC=@MarcaPC, OtrasConsideraciones=@OtrasConsideraciones WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_Deletept_HardwareIdeal', 'P') IS NOT NULL DROP PROCEDURE sp_Deletept_HardwareIdeal;
GO
CREATE PROCEDURE sp_Deletept_HardwareIdeal @Id INT AS BEGIN DELETE FROM pt_HardwareIdeal WHERE Id = @Id; END;
GO

-- pt_HardwareAsignado CRUD
IF OBJECT_ID('sp_Getpt_HardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_HardwareAsignado;
GO
CREATE PROCEDURE sp_Getpt_HardwareAsignado AS BEGIN SELECT * FROM pt_HardwareAsignado END;
GO

IF OBJECT_ID('sp_Creatept_HardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_Creatept_HardwareAsignado;
GO
CREATE PROCEDURE sp_Creatept_HardwareAsignado @EmpleadoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100),  @OtrasConsideraciones NVARCHAR(MAX), @Placa NVARCHAR(100) AS
BEGIN
    INSERT INTO pt_HardwareAsignado (EmpleadoId, TipoEquipo, Procesador, Memoria, Disco, MarcaPC, OtrasConsideraciones, Placa)
    VALUES (@EmpleadoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones, @Placa);
END;
GO

IF OBJECT_ID('sp_Updatept_HardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_Updatept_HardwareAsignado;
GO
CREATE PROCEDURE sp_Updatept_HardwareAsignado @Id INT, @EmpleadoId INT, @TipoEquipo NVARCHAR(100), @Procesador NVARCHAR(100), @Memoria NVARCHAR(50), @Disco NVARCHAR(50), @MarcaPC NVARCHAR(100),  @OtrasConsideraciones NVARCHAR(MAX), @Placa NVARCHAR(100) AS
BEGIN
    UPDATE pt_HardwareAsignado SET EmpleadoId=@EmpleadoId, TipoEquipo=@TipoEquipo, Procesador=@Procesador, Memoria=@Memoria, Disco=@Disco, MarcaPC=@MarcaPC, OtrasConsideraciones=@OtrasConsideraciones, Placa=@Placa WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_Deletept_HardwareAsignado', 'P') IS NOT NULL DROP PROCEDURE sp_Deletept_HardwareAsignado;
GO
CREATE PROCEDURE sp_Deletept_HardwareAsignado @Id INT AS BEGIN DELETE FROM pt_HardwareAsignado WHERE Id = @Id; END;
GO

-- pt_SoftwareLocal CRUD
IF OBJECT_ID('sp_Getpt_SoftwareLocales', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_SoftwareLocales;
GO
CREATE PROCEDURE sp_Getpt_SoftwareLocales
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

IF OBJECT_ID('sp_Creatept_SoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_Creatept_SoftwareLocal;
GO
CREATE PROCEDURE sp_Creatept_SoftwareLocal @EmpleadoId INT, @Equipo NVARCHAR(100), @GruposAD NVARCHAR(250), @NombreSoftware NVARCHAR(150), @Version NVARCHAR(50), @Fabricante NVARCHAR(100) AS
BEGIN
    INSERT INTO pt_SoftwareLocal (EmpleadoId, Equipo, GruposAD, NombreSoftware, Version, Fabricante) VALUES (@EmpleadoId, @Equipo, @GruposAD, @NombreSoftware, @Version, @Fabricante);
END;
GO

IF OBJECT_ID('sp_Updatept_SoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_Updatept_SoftwareLocal;
GO
CREATE PROCEDURE sp_Updatept_SoftwareLocal @Id INT, @EmpleadoId INT, @Equipo NVARCHAR(100), @GruposAD NVARCHAR(250), @NombreSoftware NVARCHAR(150), @Version NVARCHAR(50), @Fabricante NVARCHAR(100) AS
BEGIN
    UPDATE pt_SoftwareLocal SET EmpleadoId=@EmpleadoId, Equipo=@Equipo, GruposAD=@GruposAD, NombreSoftware=@NombreSoftware, Version=@Version, Fabricante=@Fabricante WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_Deletept_SoftwareLocal', 'P') IS NOT NULL DROP PROCEDURE sp_Deletept_SoftwareLocal;
GO
CREATE PROCEDURE sp_Deletept_SoftwareLocal @Id INT AS BEGIN DELETE FROM pt_SoftwareLocal WHERE Id = @Id; END;
GO

-- pt_PermisosSitio CRUD
IF OBJECT_ID('sp_Getpt_PermisosSitios', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_PermisosSitios;
GO
CREATE PROCEDURE sp_Getpt_PermisosSitios AS BEGIN SELECT * FROM pt_PermisosSitio END;
GO

IF OBJECT_ID('sp_Creatept_PermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_Creatept_PermisosSitio;
GO
CREATE PROCEDURE sp_Creatept_PermisosSitio @EmpleadoId INT, @Sitio NVARCHAR(150), @Ambiente NVARCHAR(100), @Grupospt_Permisos NVARCHAR(250) AS
BEGIN
    INSERT INTO pt_PermisosSitio (EmpleadoId, Sitio, Ambiente, Grupospt_Permisos) VALUES (@EmpleadoId, @Sitio, @Ambiente, @Grupospt_Permisos);
END;
GO

IF OBJECT_ID('sp_Updatept_PermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_Updatept_PermisosSitio;
GO
CREATE PROCEDURE sp_Updatept_PermisosSitio @Id INT, @EmpleadoId INT, @Sitio NVARCHAR(150), @Ambiente NVARCHAR(100), @Grupospt_Permisos NVARCHAR(250) AS
BEGIN
    UPDATE pt_PermisosSitio SET EmpleadoId=@EmpleadoId, Sitio=@Sitio, Ambiente=@Ambiente, Grupospt_Permisos=@Grupospt_Permisos WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_Deletept_PermisosSitio', 'P') IS NOT NULL DROP PROCEDURE sp_Deletept_PermisosSitio;
GO
CREATE PROCEDURE sp_Deletept_PermisosSitio @Id INT AS BEGIN DELETE FROM pt_PermisosSitio WHERE Id = @Id; END;
GO

-- pt_Plataformas CRUD
IF OBJECT_ID('sp_Getpt_Plataformas', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_Plataformas;
GO
CREATE PROCEDURE sp_Getpt_Plataformas AS BEGIN SELECT * FROM pt_Plataformas END;
GO

IF OBJECT_ID('sp_CreatePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePlataforma;
GO
CREATE PROCEDURE sp_CreatePlataforma @EmpleadoId INT, @NombrePlataforma NVARCHAR(150), @Licencias NVARCHAR(100), @Modulos NVARCHAR(250), @Accesospt_Permisos NVARCHAR(250), @NivelAcceso NVARCHAR(100) AS
BEGIN
    INSERT INTO pt_Plataformas (EmpleadoId, NombrePlataforma, Licencias, Modulos, Accesospt_Permisos, NivelAcceso) VALUES (@EmpleadoId, @NombrePlataforma, @Licencias, @Modulos, @Accesospt_Permisos, @NivelAcceso);
END;
GO

IF OBJECT_ID('sp_UpdatePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_UpdatePlataforma;
GO
CREATE PROCEDURE sp_UpdatePlataforma @Id INT, @EmpleadoId INT, @NombrePlataforma NVARCHAR(150), @Licencias NVARCHAR(100), @Modulos NVARCHAR(250), @Accesospt_Permisos NVARCHAR(250), @NivelAcceso NVARCHAR(100) AS
BEGIN
    UPDATE pt_Plataformas SET EmpleadoId=@EmpleadoId, NombrePlataforma=@NombrePlataforma, Licencias=@Licencias, Modulos=@Modulos, Accesospt_Permisos=@Accesospt_Permisos, NivelAcceso=@NivelAcceso WHERE Id = @Id;
END;
GO

IF OBJECT_ID('sp_DeletePlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_DeletePlataforma;
GO
CREATE PROCEDURE sp_DeletePlataforma @Id INT AS BEGIN DELETE FROM pt_Plataformas WHERE Id = @Id; END;
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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_pt_Plataformas')
BEGIN
    CREATE TABLE Cat_pt_Plataformas (
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

IF NOT EXISTS (SELECT * FROM Cat_pt_Plataformas)
BEGIN
    INSERT INTO Cat_pt_Plataformas (Nombre) VALUES ('Moodle'), ('Office 365'), ('Azure'), ('AWS');
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

-- Cat_pt_Plataformas
IF OBJECT_ID('sp_GetCatpt_Plataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetCatpt_Plataformas;
GO
CREATE PROCEDURE sp_GetCatpt_Plataformas AS BEGIN SELECT * FROM Cat_pt_Plataformas END;
GO
IF OBJECT_ID('sp_CreateCatPlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_CreateCatPlataforma;
GO
CREATE PROCEDURE sp_CreateCatPlataforma @Nombre NVARCHAR(150) AS BEGIN INSERT INTO Cat_pt_Plataformas (Nombre) VALUES (@Nombre); END;
GO
IF OBJECT_ID('sp_DeleteCatPlataforma', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteCatPlataforma;
GO
CREATE PROCEDURE sp_DeleteCatPlataforma @Id INT AS BEGIN DELETE FROM Cat_pt_Plataformas WHERE Id = @Id; END;
GO


-- NUEVOS CATÁLOGOS BASE SOLICITADOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_NivelesAcceso')
BEGIN
    CREATE TABLE Cat_NivelesAcceso (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cat_pt_PlataformasNombres')
BEGIN
    CREATE TABLE Cat_pt_PlataformasNombres (
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

IF NOT EXISTS (SELECT * FROM Cat_pt_PlataformasNombres)
BEGIN
    INSERT INTO Cat_pt_PlataformasNombres (Nombre) VALUES ('Microsoft Visual Studio'), ('SQL Server Management Studio'), ('Office 365'), ('Moodle'), ('Avatar Producción');
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

IF OBJECT_ID('sp_Getpt_PlataformasNombres', 'P') IS NOT NULL DROP PROCEDURE sp_Getpt_PlataformasNombres;
GO
CREATE PROCEDURE sp_Getpt_PlataformasNombres AS BEGIN SELECT * FROM Cat_pt_PlataformasNombres END;
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
    FROM pt_Empleados E
    INNER JOIN pt_Puestos P ON E.PuestoId = P.Id
    LEFT JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
    LEFT JOIN pt_SoftwareLocal S ON S.EmpleadoId = E.Id
    LEFT JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
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
        H.OtrasConsideraciones
    FROM pt_Empleados E
    INNER JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
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
    FROM pt_Empleados E
    INNER JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%';
END
GO

IF OBJECT_ID('sp_GetReporteIntegralpt_Plataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralpt_Plataformas;
GO
CREATE PROCEDURE sp_GetReporteIntegralpt_Plataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        P.NombrePuesto AS Puesto,
        E.NombreCompleto AS Nombre,
        Pl.Licencias,
        Pl.NombrePlataforma AS pt_Plataformas,
        Pl.Modulos,
        Pl.Accesospt_Permisos AS AccesosYpt_Permisos,
        Pl.NivelAcceso
    FROM pt_Empleados E
    INNER JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
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
        ISNULL(H.OtrasConsideraciones, '') AS OtrasConsideraciones
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
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
        S.Grupospt_Permisos
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

IF OBJECT_ID('sp_GetReporteIntegralpt_Plataformas', 'P') IS NOT NULL DROP PROCEDURE sp_GetReporteIntegralpt_Plataformas;
GO
CREATE PROCEDURE sp_GetReporteIntegralpt_Plataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        Pl.Licencias,
        Pl.NombrePlataforma AS pt_Plataformas,
        Pl.Modulos,
        Pl.Accesospt_Permisos AS AccesosYpt_Permisos,
        Pl.NivelAcceso
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

-- RECREACIÓN DE STORED PROCEDURES PARA REPORTE INTEGRAL (CON CREATE OR ALTER)
GO
CREATE OR ALTER PROCEDURE sp_GetReporteIntegralHardware
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
        ISNULL(H.OtrasConsideraciones, '') AS OtrasConsideraciones
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegralSitios
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        S.Sitio,
        S.Ambiente,
        S.Grupospt_Permisos
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegralpt_Plataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        Pl.Licencias,
        Pl.NombrePlataforma AS pt_Plataformas,
        Pl.Modulos,
        Pl.Accesospt_Permisos AS AccesosYpt_Permisos,
        Pl.NivelAcceso
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    INNER JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

-- CORRECCIÓN A LEFT JOIN PARA INCLUIR pt_Empleados/pt_Puestos SIN ASIGNACIONES
GO
CREATE OR ALTER PROCEDURE sp_GetReporteIntegralHardware
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(H.TipoEquipo, '') AS Equipo,
        ISNULL(H.Procesador, '') AS Procesador,
        ISNULL(H.Memoria, '') AS Memoria,
        ISNULL(H.Disco, '') AS Disco,
        ISNULL(H.MarcaPC, '') AS MarcaPC,
        ISNULL(H.OtrasConsideraciones, '') AS OtrasConsideraciones
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    LEFT JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegralSitios
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(S.Sitio, '') AS Sitio,
        ISNULL(S.Ambiente, '') AS Ambiente,
        ISNULL(S.Grupospt_Permisos, '') AS Grupospt_Permisos
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    LEFT JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegralpt_Plataformas
    @TerminoBusqueda VARCHAR(100)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(Pl.Licencias, '') AS Licencias,
        ISNULL(Pl.NombrePlataforma, '') AS pt_Plataformas,
        ISNULL(Pl.Modulos, '') AS Modulos,
        ISNULL(Pl.Accesospt_Permisos, '') AS AccesosYpt_Permisos,
        ISNULL(Pl.NivelAcceso, '') AS NivelAcceso
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos P ON E.PuestoId = P.Id
    LEFT JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
    WHERE (P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
       OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%');
END
GO
