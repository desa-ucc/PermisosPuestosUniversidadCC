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
    public class PlataformasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PlataformasController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetPlataformas()
        {
            var data = await _context.Database.SqlQueryRaw<Plataforma>(
                "select * from v_GestionarPlataformas"
            ).ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlataforma([FromBody] Plataforma p)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='INSERT', @EmpleadoId=@e, @NombrePlataforma=@n, @Licencias=@l, @Modulos=@m, @AccesosPermisos=@a, @NivelAcceso=@na",
                new SqlParameter("@e", p.EmpleadoId),
                new SqlParameter("@n", p.NombrePlataforma ?? (object)DBNull.Value),
                new SqlParameter("@l", p.Licencias ?? (object)DBNull.Value),
                new SqlParameter("@m", p.Modulos ?? (object)DBNull.Value),
                new SqlParameter("@a", p.AccesosPermisos ?? (object)DBNull.Value),
                new SqlParameter("@na", p.NivelAcceso ?? (object)DBNull.Value)
            );
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlataforma(int id, [FromBody] Plataforma p)
        {
            if (id != p.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='UPDATE', @Id=@id, @EmpleadoId=@e, @NombrePlataforma=@n, @Licencias=@l, @Modulos=@m, @AccesosPermisos=@a, @NivelAcceso=@na",
                new SqlParameter("@id", id),
                new SqlParameter("@e", p.EmpleadoId),
                new SqlParameter("@n", p.NombrePlataforma ?? (object)DBNull.Value),
                new SqlParameter("@l", p.Licencias ?? (object)DBNull.Value),
                new SqlParameter("@m", p.Modulos ?? (object)DBNull.Value),
                new SqlParameter("@a", p.AccesosPermisos ?? (object)DBNull.Value),
                new SqlParameter("@na", p.NivelAcceso ?? (object)DBNull.Value)
            );
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlataforma(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='DELETE', @Id=@id",
                new SqlParameter("@id", id)
            );
            return NoContent();
        }
    }
}
