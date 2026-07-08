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
            var reporte = _context.ReportesPerfilDto
                .FromSqlRaw("EXEC sp_GetReportePerfilTecnologico @CodigoPerfil", p1)
                .AsEnumerable().ToList();

            return Ok(reporte);
        }

        [HttpGet("integral/{termino}")]
        public async Task<IActionResult> GetReporteIntegral(string termino)
        {
            var p1 = new SqlParameter("@TerminoBusqueda", termino);
            var p2 = new SqlParameter("@TerminoBusqueda", termino);
            var p3 = new SqlParameter("@TerminoBusqueda", termino);

            var hw = _context.ReportesHardwareDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralHardware @TerminoBusqueda", p1)
                .AsEnumerable().ToList();

            var sit = _context.ReportesSitiosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralSitios @TerminoBusqueda", p2)
                .AsEnumerable().ToList();

            var plat = _context.ReportesPlataformasDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralPlataformas @TerminoBusqueda", p3)
                .AsEnumerable().ToList();

            var result = new ReporteIntegralResponse
            {
                Hardware = hw,
                Sitios = sit,
                Plataformas = plat
            };

            return Ok(result);
        }
    }
}
