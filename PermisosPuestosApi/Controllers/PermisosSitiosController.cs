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
    public class PermisosSitiosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermisosSitiosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPermisosSitios()
        {
            var data = await _context.PermisosSitios.FromSqlRaw("EXEC sp_GetPermisosSitios").ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePermisosSitio([FromBody] PermisosSitio ps)
        {
            var p1 = new SqlParameter("@EmpleadoId", ps.EmpleadoId);
            var p2 = new SqlParameter("@Sitio", ps.Sitio);
            var p3 = new SqlParameter("@Ambiente", ps.Ambiente);
            var p4 = new SqlParameter("@GruposPermisos", ps.GruposPermisos);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreatePermisosSitio @EmpleadoId, @Sitio, @Ambiente, @GruposPermisos", p1, p2, p3, p4);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermisosSitio(int id, [FromBody] PermisosSitio ps)
        {
            if (id != ps.Id) return BadRequest();

            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@EmpleadoId", ps.EmpleadoId);
            var p2 = new SqlParameter("@Sitio", ps.Sitio);
            var p3 = new SqlParameter("@Ambiente", ps.Ambiente);
            var p4 = new SqlParameter("@GruposPermisos", ps.GruposPermisos);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdatePermisosSitio @Id, @EmpleadoId, @Sitio, @Ambiente, @GruposPermisos", pId, p1, p2, p3, p4);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermisosSitio(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeletePermisosSitio @Id", pId);
            return NoContent();
        }
    }
}
