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
    public class PuestosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PuestosController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetPuestos()
        {
            var data = _context.Puestos.FromSqlRaw("EXEC sp_GetPuestos").AsEnumerable().ToList();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePuesto([FromBody] Puesto p)
        {
            var p1 = new SqlParameter("@CodigoPuesto", p.CodigoPuesto);
            var p2 = new SqlParameter("@NombrePuesto", p.NombrePuesto);
            var p3 = new SqlParameter("@Descripcion", p.Descripcion ?? (object)DBNull.Value);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreatePuesto @CodigoPuesto, @NombrePuesto, @Descripcion", p1, p2, p3);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePuesto(int id, [FromBody] Puesto p)
        {
            if (id != p.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@CodigoPuesto", p.CodigoPuesto);
            var p2 = new SqlParameter("@NombrePuesto", p.NombrePuesto);
            var p3 = new SqlParameter("@Descripcion", p.Descripcion ?? (object)DBNull.Value);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdatePuesto @Id, @CodigoPuesto, @NombrePuesto, @Descripcion", pId, p1, p2, p3);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePuesto(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeletePuesto @Id", pId);
            return NoContent();
        }
    }
}
