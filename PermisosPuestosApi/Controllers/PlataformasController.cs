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

        public PlataformasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlataformas()
        {
            var data = await _context.Plataformas.FromSqlRaw("EXEC sp_GetPlataformas").ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlataforma([FromBody] Plataforma p)
        {
            var p1 = new SqlParameter("@EmpleadoId", p.EmpleadoId);
            var p2 = new SqlParameter("@NombrePlataforma", p.NombrePlataforma);
            var p3 = new SqlParameter("@Licencias", p.Licencias);
            var p4 = new SqlParameter("@Modulos", p.Modulos);
            var p5 = new SqlParameter("@AccesosPermisos", p.AccesosPermisos);
            var p6 = new SqlParameter("@NivelAcceso", p.NivelAcceso);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreatePlataforma @EmpleadoId, @NombrePlataforma, @Licencias, @Modulos, @AccesosPermisos, @NivelAcceso", p1, p2, p3, p4, p5, p6);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlataforma(int id, [FromBody] Plataforma p)
        {
            if (id != p.Id) return BadRequest();

            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@EmpleadoId", p.EmpleadoId);
            var p2 = new SqlParameter("@NombrePlataforma", p.NombrePlataforma);
            var p3 = new SqlParameter("@Licencias", p.Licencias);
            var p4 = new SqlParameter("@Modulos", p.Modulos);
            var p5 = new SqlParameter("@AccesosPermisos", p.AccesosPermisos);
            var p6 = new SqlParameter("@NivelAcceso", p.NivelAcceso);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdatePlataforma @Id, @EmpleadoId, @NombrePlataforma, @Licencias, @Modulos, @AccesosPermisos, @NivelAcceso", pId, p1, p2, p3, p4, p5, p6);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlataforma(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeletePlataforma @Id", pId);
            return NoContent();
        }
    }
}
