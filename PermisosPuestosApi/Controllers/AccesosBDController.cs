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
    public class AccesosBDController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccesosBDController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAccesosBD()
        {
            var data = await _context.AccesosBDDto
                .FromSqlRaw("SELECT * FROM v_GestionarAccesosBD")
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAccesoBD([FromBody] AccesoBD p)
        {
            var pAccion = new SqlParameter("@Accion", "INSERT");
            var pEmpleadoId = new SqlParameter("@EmpleadoId", p.EmpleadoId);
            var pServidor = new SqlParameter("@Servidor", p.Servidor);
            var pBaseDatos = new SqlParameter("@BaseDatos", p.BaseDatos);
            var pNivelAcceso = new SqlParameter("@NivelAcceso", p.NivelAcceso);
            var pObservaciones = new SqlParameter("@Observaciones", p.Observaciones ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarAccesosBD @Accion, NULL, @EmpleadoId, @Servidor, @BaseDatos, @NivelAcceso, @Observaciones",
                pAccion, pEmpleadoId, pServidor, pBaseDatos, pNivelAcceso, pObservaciones);

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccesoBD(int id, [FromBody] AccesoBD p)
        {
            if (id != p.Id) return BadRequest();

            var pAccion = new SqlParameter("@Accion", "UPDATE");
            var pId = new SqlParameter("@Id", id);
            var pEmpleadoId = new SqlParameter("@EmpleadoId", p.EmpleadoId);
            var pServidor = new SqlParameter("@Servidor", p.Servidor);
            var pBaseDatos = new SqlParameter("@BaseDatos", p.BaseDatos);
            var pNivelAcceso = new SqlParameter("@NivelAcceso", p.NivelAcceso);
            var pObservaciones = new SqlParameter("@Observaciones", p.Observaciones ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarAccesosBD @Accion, @Id, @EmpleadoId, @Servidor, @BaseDatos, @NivelAcceso, @Observaciones",
                pAccion, pId, pEmpleadoId, pServidor, pBaseDatos, pNivelAcceso, pObservaciones);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccesoBD(int id)
        {
            var pAccion = new SqlParameter("@Accion", "DELETE");
            var pId = new SqlParameter("@Id", id);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarAccesosBD @Accion, @Id",
                pAccion, pId);

            return NoContent();
        }
    }
}
