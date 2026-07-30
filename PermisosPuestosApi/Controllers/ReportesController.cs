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


        [AllowAnonymous]
        [HttpGet("ejecutar-sql")]
        public async Task<IActionResult> EjecutarSql()
        {
            var sql = System.IO.File.ReadAllText("../update_reportes_sp.sql");
            var batches = sql.Split(new[] { "GO\r\n", "GO\n", "GO" }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var batch in batches)
            {
                if (string.IsNullOrWhiteSpace(batch)) continue;
                await _context.Database.ExecuteSqlRawAsync(batch);
            }
            return Ok("Script ejecutado");
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
            var p7 = new SqlParameter("@TerminoBusqueda", termino);

            var infoBase = await _context.ReportesBaseDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_Base @TerminoBusqueda", p1)
                .ToListAsync();

            var hw = await _context.ReportesHardwareDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_Hardware @TerminoBusqueda", p2)
                .ToListAsync();

            var sit = await _context.ReportesSitiosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_Sitios @TerminoBusqueda", p3)
                .ToListAsync();

            var plat = await _context.ReportesPlataformasDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_Plataformas @TerminoBusqueda", p4)
                .ToListAsync();

            var bd = await _context.ReportesBasesDatosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_BasesDatos @TerminoBusqueda", p5)
                .ToListAsync();

            var sl = await _context.ReportesSoftwareLocalDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_SoftwareLocal @TerminoBusqueda", p6)
                .ToListAsync();

            var ei = await _context.ReportesHardwareDto
                .FromSqlRaw("EXEC sp_GetReporteIntegral_EquipoIdeal @TerminoBusqueda", p7)
                .ToListAsync();

            var result = new ReporteIntegralResponse
            {
                InformacionBase = infoBase,
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