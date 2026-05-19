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
    public class HardwareIdealController : ControllerBase
    {
        private readonly AppDbContext _context;
        public HardwareIdealController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetHardwareIdeal()
        {
            var data = await _context.HardwareIdeales.FromSqlRaw("EXEC sp_GetHardwareIdeal").ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateHardwareIdeal([FromBody] HardwareIdeal h)
        {
            var p1 = new SqlParameter("@PuestoId", h.PuestoId);
            var p2 = new SqlParameter("@TipoEquipo", h.TipoEquipo);
            var p3 = new SqlParameter("@Procesador", h.Procesador);
            var p4 = new SqlParameter("@Memoria", h.Memoria);
            var p5 = new SqlParameter("@Disco", h.Disco);
            var p6 = new SqlParameter("@MarcaPC", h.MarcaPC);
            var p7 = new SqlParameter("@TecladoNumerico", h.TecladoNumerico);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateHardwareIdeal @PuestoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones", p1, p2, p3, p4, p5, p6, p7, p8);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHardwareIdeal(int id, [FromBody] HardwareIdeal h)
        {
            if (id != h.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@PuestoId", h.PuestoId);
            var p2 = new SqlParameter("@TipoEquipo", h.TipoEquipo);
            var p3 = new SqlParameter("@Procesador", h.Procesador);
            var p4 = new SqlParameter("@Memoria", h.Memoria);
            var p5 = new SqlParameter("@Disco", h.Disco);
            var p6 = new SqlParameter("@MarcaPC", h.MarcaPC);
            var p7 = new SqlParameter("@TecladoNumerico", h.TecladoNumerico);
            var p8 = new SqlParameter("@OtrasConsideraciones", h.OtrasConsideraciones ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateHardwareIdeal @Id, @PuestoId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @TecladoNumerico, @OtrasConsideraciones", pId, p1, p2, p3, p4, p5, p6, p7, p8);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHardwareIdeal(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteHardwareIdeal @Id", pId);
            return NoContent();
        }
    }
}
