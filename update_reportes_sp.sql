CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_Base
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        ISNULL(P.CodigoPuesto, 'N/A') AS CodigoPuesto,
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(E.CorreoInstitucional, 'N/A') AS Correo
    FROM pt_Empleados E
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_Hardware
    @TerminoBusqueda NVARCHAR(MAX)
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
    INNER JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_Sitios
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(S.Sitio, '') AS Sitio,
        ISNULL(S.Ambiente, '') AS Ambiente,
        ISNULL(S.GruposPermisos, '') AS GruposPermisos
    FROM pt_Empleados E
    INNER JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_Plataformas
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(Pl.Licencias, '') AS Licencias,
        ISNULL(Pl.NombrePlataforma, '') AS Plataformas,
        ISNULL(Pl.Modulos, '') AS Modulos,
        ISNULL(Pl.AccesosPermisos, '') AS AccesosYPermisos,
        ISNULL(Pl.NivelAcceso, '') AS NivelAcceso
    FROM pt_Empleados E
    INNER JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
       OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_BasesDatos
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(B.Servidor, '') AS Servidor,
        ISNULL(B.BaseDatos, '') AS BaseDatos,
        ISNULL(B.NivelAcceso, '') AS NivelAcceso,
        ISNULL(B.Observaciones, '') AS Observaciones
    FROM pt_Empleados E
    INNER JOIN pt_AccesosBD B ON B.EmpleadoId = E.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
        OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
        OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_SoftwareLocal
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
        E.NombreCompleto AS Nombre,
        ISNULL(S.Equipo, '') AS Equipo,
        ISNULL(S.GruposAD, '') AS GruposAD,
        ISNULL(S.NombreSoftware, '') AS NombreSoftware,
        ISNULL(S.Version, '') AS Version,
        ISNULL(S.Fabricante, '') AS Fabricante
    FROM pt_Empleados E
    INNER JOIN pt_SoftwareLocal S ON S.EmpleadoId = E.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
    LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
    WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
        OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
        OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')
END;
GO

CREATE OR ALTER PROCEDURE sp_GetReporteIntegral_EquipoIdeal
    @TerminoBusqueda NVARCHAR(MAX)
AS
BEGIN
    SELECT
        P.NombrePuesto AS Puesto,
        ISNULL(E.NombreCompleto, 'Configuración General del Puesto') AS Nombre,
        ISNULL(H.TipoEquipo, '') AS Equipo,
        ISNULL(H.Procesador, '') AS Procesador,
        ISNULL(H.Memoria, '') AS Memoria,
        ISNULL(H.Disco, '') AS Disco,
        ISNULL(H.MarcaPC, '') AS MarcaPC,
        ISNULL(H.OtrasConsideraciones, '') AS OtrasConsideraciones
    FROM pt_Puestos P
    INNER JOIN pt_HardwareIdeal H ON H.PuestoId = P.Id
    LEFT JOIN pt_Puestos_X_Empleado PXE ON PXE.PuestoId = P.Id
    LEFT JOIN pt_Empleados E ON E.Id = PXE.EmpleadoId
    WHERE (
        P.CodigoPuesto LIKE '%' + @TerminoBusqueda + '%'
        OR P.NombrePuesto LIKE '%' + @TerminoBusqueda + '%'
        OR ISNULL(E.NombreCompleto, '') LIKE '%' + @TerminoBusqueda + '%'
    )
END;
GO
