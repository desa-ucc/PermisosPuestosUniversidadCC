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
            var data = await _context.Puestos
                .FromSqlRaw("Select * from v_GestionarPuestos")
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePuesto([FromBody] Puesto p)
        {
            var accion = new SqlParameter("@Accion", "INSERT");
            var cod = new SqlParameter("@CodigoPuesto", p.CodigoPuesto);
            var nom = new SqlParameter("@NombrePuesto", p.NombrePuesto);
            var desc = new SqlParameter("@Descripcion", (object)p.Descripcion ?? DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPuestos @Accion, @CodigoPuesto=@CodigoPuesto, @NombrePuesto=@NombrePuesto, @Descripcion=@Descripcion", 
                accion, cod, nom, desc);
            
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePuesto(int id, [FromBody] Puesto p)
        {
            if (id != p.Id) return BadRequest();

            var accion = new SqlParameter("@Accion", "UPDATE");
            var pid = new SqlParameter("@Id", id);
            var cod = new SqlParameter("@CodigoPuesto", p.CodigoPuesto);
            var nom = new SqlParameter("@NombrePuesto", p.NombrePuesto);
            var desc = new SqlParameter("@Descripcion", (object)p.Descripcion ?? DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPuestos @Accion, @Id=@Id, @CodigoPuesto=@CodigoPuesto, @NombrePuesto=@NombrePuesto, @Descripcion=@Descripcion", 
                accion, pid, cod, nom, desc);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePuesto(int id)
        {
            var accion = new SqlParameter("@Accion", "DELETE");
            var pid = new SqlParameter("@Id", id);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPuestos @Accion, @Id=@Id", accion, pid);
            
            return NoContent();
        }
    }
}