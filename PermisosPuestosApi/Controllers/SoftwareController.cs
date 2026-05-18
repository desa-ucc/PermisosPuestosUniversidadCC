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
    public class SoftwareController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SoftwareController(AppDbContext context) { _context = context; }

        [HttpGet("Local")]
        public async Task<IActionResult> GetSoftwareLocales()
        {
            var data = await _context.SoftwareLocales.FromSqlRaw("EXEC sp_GetSoftwareLocales").ToListAsync();
            return Ok(data);
        }

        [HttpPost("Local")]
        public async Task<IActionResult> CreateSoftwareLocal([FromBody] SoftwareLocal s)
        {
            var p1 = new SqlParameter("@EmpleadoId", s.EmpleadoId);
            var p2 = new SqlParameter("@Equipo", s.Equipo);
            var p3 = new SqlParameter("@GruposAD", s.GruposAD);
            var p4 = new SqlParameter("@NombreSoftware", s.NombreSoftware);
            var p5 = new SqlParameter("@Version", s.Version);
            var p6 = new SqlParameter("@Fabricante", s.Fabricante);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateSoftwareLocal @EmpleadoId, @Equipo, @GruposAD, @NombreSoftware, @Version, @Fabricante", p1, p2, p3, p4, p5, p6);
            return Ok();
        }

        [HttpPut("Local/{id}")]
        public async Task<IActionResult> UpdateSoftwareLocal(int id, [FromBody] SoftwareLocal s)
        {
            if (id != s.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@EmpleadoId", s.EmpleadoId);
            var p2 = new SqlParameter("@Equipo", s.Equipo);
            var p3 = new SqlParameter("@GruposAD", s.GruposAD);
            var p4 = new SqlParameter("@NombreSoftware", s.NombreSoftware);
            var p5 = new SqlParameter("@Version", s.Version);
            var p6 = new SqlParameter("@Fabricante", s.Fabricante);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateSoftwareLocal @Id, @EmpleadoId, @Equipo, @GruposAD, @NombreSoftware, @Version, @Fabricante", pId, p1, p2, p3, p4, p5, p6);
            return NoContent();
        }

        [HttpDelete("Local/{id}")]
        public async Task<IActionResult> DeleteSoftwareLocal(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteSoftwareLocal @Id", pId);
            return NoContent();
        }
    }
}
