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
    public class EquiposController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EquiposController(AppDbContext context) { _context = context; }

        [HttpGet("Asignado")]
        public async Task<IActionResult> GetHardwareAsignado()
        {
            var data = await _context.HardwareAsignados.FromSqlRaw("EXEC sp_GetHardwareAsignado").ToListAsync();
            return Ok(data);
        }

        [HttpPost("Asignado")]
        public async Task<IActionResult> CreateHardwareAsignado([FromBody] HardwareAsignado h)
        {
            var p1 = new SqlParameter("@EmpleadoId", h.EmpleadoId);
            var p2 = new SqlParameter("@TipoHardwareId", h.TipoHardwareId ?? (object)DBNull.Value);
            var p2b = new SqlParameter("@TipoEquipo", h.TipoEquipo ?? (object)DBNull.Value);
           // Cambia tus parámetros de string así:
            var p3 = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador);
            var p4 = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria);
            var p5 = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco);
            var p6 = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);
            var p9 = new SqlParameter("@Placa", h.Placa);

            try {
                await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateHardwareAsignado @EmpleadoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones, @Placa", p1, p2, p2b, p3, p4, p5, p6, p8, p9);
            return Ok();

            } catch (Exception ex) {
                Console.WriteLine($"Error SQL al crear Hardware Asignado: {ex.Message}");
                return StatusCode(500, ex.Message);
            }}

        [HttpPut("Asignado/{id}")]
        public async Task<IActionResult> UpdateHardwareAsignado(int id, [FromBody] HardwareAsignado h)
        {
            if (id != h.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@EmpleadoId", h.EmpleadoId);
            var p2 = new SqlParameter("@TipoHardwareId", h.TipoHardwareId ?? (object)DBNull.Value);
            // Cambia tus parámetros de string así:
            var p3 = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador);
            var p4 = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria);
            var p5 = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco);
            var p6 = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);
            var p9 = new SqlParameter("@Placa", h.Placa);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateHardwareAsignado @Id, @EmpleadoId, @TipoHardwareId, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones, @Placa", pId, p1, p2, p3, p4, p5, p6, p8, p9);
            return NoContent();
        }

        [HttpDelete("Asignado/{id}")]
        public async Task<IActionResult> DeleteHardwareAsignado(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteHardwareAsignado @Id", pId);
            return NoContent();
        }
    }
}
