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
    }
}
