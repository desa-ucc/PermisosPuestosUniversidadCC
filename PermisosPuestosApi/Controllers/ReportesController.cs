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
            // ZERO LINQ RULE ENFORCED
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

            var hw = await _context.ReportesHardwareDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralHardware @TerminoBusqueda", p1)
                .ToListAsync();

            var sit = await _context.ReportesSitiosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralSitios @TerminoBusqueda", p2)
                .ToListAsync();

            var plat = await _context.ReportesPlataformasDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralPlataformas @TerminoBusqueda", p3)
                .ToListAsync();

            var bd = await _context.ReportesBasesDatosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralBasesDatos @TerminoBusqueda", p4)
                .ToListAsync();

            var sl = await _context.ReportesSoftwareLocalDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralSoftwareLocal @TerminoBusqueda", p5)
                .ToListAsync();

            var result = new ReporteIntegralResponse
            {
                Hardware = hw,
                Sitios = sit,
                Plataformas = plat,
                BasesDatos = bd,
                SoftwareLocal = sl
            };

            return Ok(result);
        }
    }
}
