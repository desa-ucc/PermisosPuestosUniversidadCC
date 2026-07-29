using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("perfil/{codigo}")]
        public async Task<IActionResult> GetReportePorPerfil(string codigo)
        {
            var p1 = new SqlParameter("@CodigoPerfil", codigo);
            var reporte = await _context.ReportesPerfilDto
                .FromSqlRaw("EXEC sp_GetReportePerfilTecnologico @CodigoPerfil", p1)
                .ToListAsync();

            return Ok(reporte);
        }

        [HttpGet("integral/{termino}")]
        public async Task<IActionResult> GetReporteIntegral(string termino)
        {
            var p1 = new SqlParameter("@TerminoBusqueda", termino);
            var p2 = new SqlParameter("@TerminoBusqueda", termino);
            var p3 = new SqlParameter("@TerminoBusqueda", termino);
            var p4 = new SqlParameter("@TerminoBusqueda", termino);
            var p5 = new SqlParameter("@TerminoBusqueda", termino);
            var p6 = new SqlParameter("@TerminoBusqueda", termino);

            // 1. Hardware Asignado (Partiendo de Empleado y Puesto real)
            var sqlHw = @"
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
                LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
                LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
                LEFT JOIN pt_HardwareAsignado H ON H.EmpleadoId = E.Id
                WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')";
            var hw = await _context.ReportesHardwareDto
                .FromSqlRaw(sqlHw, p1)
                .ToListAsync();

            // 2. Sitios (Partiendo de Empleado y Puesto real)
            var sqlSit = @"
                SELECT
                    ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
                    E.NombreCompleto AS Nombre,
                    ISNULL(S.Sitio, '') AS Sitio,
                    ISNULL(S.Ambiente, '') AS Ambiente,
                    ISNULL(S.GruposPermisos, '') AS GruposPermisos
                FROM pt_Empleados E
                LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
                LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
                LEFT JOIN pt_PermisosSitio S ON S.EmpleadoId = E.Id
                WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')";
            var sit = await _context.ReportesSitiosDto
                .FromSqlRaw(sqlSit, p2)
                .ToListAsync();

            // 3. Plataformas (Partiendo de Empleado y Puesto real)
            var sqlPlat = @"
                SELECT
                    ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
                    E.NombreCompleto AS Nombre,
                    ISNULL(Pl.Licencias, '') AS Licencias,
                    ISNULL(Pl.NombrePlataforma, '') AS Plataformas,
                    ISNULL(Pl.Modulos, '') AS Modulos,
                    ISNULL(Pl.AccesosPermisos, '') AS AccesosYPermisos,
                    ISNULL(Pl.NivelAcceso, '') AS NivelAcceso
                FROM pt_Empleados E
                LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
                LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
                LEFT JOIN pt_Plataformas Pl ON Pl.EmpleadoId = E.Id
                WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                   OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')";
            var plat = await _context.ReportesPlataformasDto
                .FromSqlRaw(sqlPlat, p3)
                .ToListAsync();

            // 4. Bases de Datos (Partiendo de Empleado y Puesto real)
            var sqlBd = @"
                SELECT
                    ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
                    E.NombreCompleto AS Nombre,
                    ISNULL(B.Servidor, '') AS Servidor,
                    ISNULL(B.BaseDatos, '') AS BaseDatos,
                    ISNULL(B.NivelAcceso, '') AS NivelAcceso,
                    ISNULL(B.Observaciones, '') AS Observaciones
                FROM pt_Empleados E
                LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
                LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
                LEFT JOIN pt_AccesosBD B ON B.EmpleadoId = E.Id
                WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                    OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                    OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')";
            var bd = await _context.ReportesBasesDatosDto
                .FromSqlRaw(sqlBd, p4)
                .ToListAsync();

            // 5. Software Local (Partiendo de Empleado y Puesto real)
            var sqlSl = @"
                SELECT
                    ISNULL(P.NombrePuesto, 'No Asignado') AS Puesto,
                    E.NombreCompleto AS Nombre,
                    ISNULL(S.Equipo, '') AS Equipo,
                    ISNULL(S.GruposAD, '') AS GruposAD,
                    ISNULL(S.NombreSoftware, '') AS NombreSoftware,
                    ISNULL(S.Version, '') AS Version,
                    ISNULL(S.Fabricante, '') AS Fabricante
                FROM pt_Empleados E
                LEFT JOIN pt_Puestos_X_Empleado PXE ON E.Id = PXE.EmpleadoId
                LEFT JOIN pt_Puestos P ON PXE.PuestoId = P.Id
                LEFT JOIN pt_SoftwareLocal S ON S.EmpleadoId = E.Id
                WHERE (ISNULL(P.CodigoPuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                    OR ISNULL(P.NombrePuesto, '') LIKE '%' + @TerminoBusqueda + '%'
                    OR E.NombreCompleto LIKE '%' + @TerminoBusqueda + '%')";
            var sl = await _context.ReportesSoftwareLocalDto
                .FromSqlRaw(sqlSl, p5)
                .ToListAsync();

            // 6. Equipo Ideal del Puesto
            var sqlEi = @"
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
                )";
            var ei = await _context.ReportesHardwareDto
                .FromSqlRaw(sqlEi, p6)
                .ToListAsync();

            var result = new ReporteIntegralResponse
            {
                Hardware = hw,
                EquipoIdeal = ei,
                Sitios = sit,
                Plataformas = plat,
                BasesDatos = bd,
                SoftwareLocal = sl
            };

            return Ok(result);
        }
    }
}