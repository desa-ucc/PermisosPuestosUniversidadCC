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
    public class EmpleadosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EmpleadosController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetEmpleados()
        {
            var data = _context.EmpleadosDto.FromSqlRaw("EXEC sp_GetEmpleados").AsEnumerable().ToList();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEmpleado([FromBody] Empleado e)
        {
            var p1 = new SqlParameter("@CodigoEmpleado", e.CodigoEmpleado);
            var p2 = new SqlParameter("@NombreCompleto", e.NombreCompleto);
            var p3 = new SqlParameter("@CorreoInstitucional", e.CorreoInstitucional);
            var p4 = new SqlParameter("@PuestoId", e.PuestoId ?? (object)DBNull.Value);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateEmpleado @CodigoEmpleado, @NombreCompleto, @CorreoInstitucional, @PuestoId", p1, p2, p3, p4);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, [FromBody] Empleado e)
        {
            if (id != e.Id) return BadRequest();
            var pId = new SqlParameter("@Id", id);
            var p1 = new SqlParameter("@CodigoEmpleado", e.CodigoEmpleado);
            var p2 = new SqlParameter("@NombreCompleto", e.NombreCompleto);
            var p3 = new SqlParameter("@CorreoInstitucional", e.CorreoInstitucional);
            var p4 = new SqlParameter("@PuestoId", e.PuestoId ?? (object)DBNull.Value);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateEmpleado @Id, @CodigoEmpleado, @NombreCompleto, @CorreoInstitucional, @PuestoId", pId, p1, p2, p3, p4);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteEmpleado @Id", pId);
            return NoContent();
        }
    }
}
