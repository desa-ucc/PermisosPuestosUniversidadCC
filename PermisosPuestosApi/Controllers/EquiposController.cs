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
            System.Console.WriteLine($"Length of data: {data.Count}");
            if(data.Count > 0) { System.Console.WriteLine($"CodigoPuesto: {data[0].CodigoPuesto}, NombrePuesto: {data[0].NombrePuesto}"); }
            return Ok(data);
        }

        [HttpPost("Asignado")]
        public async Task<IActionResult> CreateHardwareAsignado([FromBody] HardwareAsignado h)
        {
            var p1 = new SqlParameter("@EmpleadoId", h.EmpleadoId);
            var p2 = new SqlParameter("@TipoEquipo", h.TipoEquipo);
            var p3 = new SqlParameter("@Procesador", h.Procesador);
            var p4 = new SqlParameter("@Memoria", h.Memoria);
            var p5 = new SqlParameter("@Disco", h.Disco);
            var p6 = new SqlParameter("@MarcaPC", h.MarcaPC);
            var p7 = new SqlParameter("@TecladoNumerico", h.TecladoNumerico);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);
            var p9 = new SqlParameter("@Placa", h.Placa);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateHardwareAsignado @EmpleadoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones, @Placa", p1, p2, p3, p4, p5, p6, p7, p8, p9);
            return Ok();
        }

        [HttpPut("Asignado/{id}")]
        public async Task<IActionResult> UpdateHardwareAsignado(int id, [FromBody] HardwareAsignado h)
        {
            if (id != h.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@EmpleadoId", h.EmpleadoId);
            var p2 = new SqlParameter("@TipoEquipo", h.TipoEquipo);
            var p3 = new SqlParameter("@Procesador", h.Procesador);
            var p4 = new SqlParameter("@Memoria", h.Memoria);
            var p5 = new SqlParameter("@Disco", h.Disco);
            var p6 = new SqlParameter("@MarcaPC", h.MarcaPC);
            var p7 = new SqlParameter("@TecladoNumerico", h.TecladoNumerico);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);
            var p9 = new SqlParameter("@Placa", h.Placa);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateHardwareAsignado @Id, @EmpleadoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones, @Placa", pId, p1, p2, p3, p4, p5, p6, p7, p8, p9);
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
