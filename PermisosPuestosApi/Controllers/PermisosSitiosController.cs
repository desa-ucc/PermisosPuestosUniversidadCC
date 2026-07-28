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
            var data = await _context.Database.SqlQueryRaw<PermisosSitio>(
                "select * from v_GestionarPermisosSitios"
            ).ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePermisosSitio([FromBody] PermisosSitio ps)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='INSERT', @EmpleadoId=@e, @Sitio=@s, @Ambiente=@a, @GruposPermisos=@g",
                new SqlParameter("@e", ps.EmpleadoId),
                new SqlParameter("@s", ps.Sitio ?? (object)DBNull.Value),
                new SqlParameter("@a", ps.Ambiente ?? (object)DBNull.Value),
                new SqlParameter("@g", ps.GruposPermisos ?? (object)DBNull.Value)
            );
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermisosSitio(int id, [FromBody] PermisosSitio ps)
        {
            if (id != ps.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='UPDATE', @Id=@id, @EmpleadoId=@e, @Sitio=@s, @Ambiente=@a, @GruposPermisos=@g",
                new SqlParameter("@id", id),
                new SqlParameter("@e", ps.EmpleadoId),
                new SqlParameter("@s", ps.Sitio ?? (object)DBNull.Value),
                new SqlParameter("@a", ps.Ambiente ?? (object)DBNull.Value),
                new SqlParameter("@g", ps.GruposPermisos ?? (object)DBNull.Value)
            );
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermisosSitio(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='DELETE', @Id=@id", 
                new SqlParameter("@id", id)
            );
            return NoContent();
        }
    }
}
