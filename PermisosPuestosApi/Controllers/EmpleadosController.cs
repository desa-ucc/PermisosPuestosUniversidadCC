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
            // Llamada al SP unificado con acción SELECT
            var data = await _context.EmpleadosDto
                .FromSqlRaw("SELECT * FROM v_GestionarEmpleados")
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEmpleado([FromBody] Empleado e)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarEmpleados @Accion='INSERT', @CodigoEmpleado={0}, @NombreCompleto={1}, @CorreoInstitucional={2}, @PuestoId={3}",
                e.CodigoEmpleado, e.NombreCompleto, e.CorreoInstitucional, (object)e.PuestoId ?? DBNull.Value);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmpleado(int id, [FromBody] Empleado e)
        {
            if (id != e.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarEmpleados @Accion='UPDATE', @Id={0}, @CodigoEmpleado={1}, @NombreCompleto={2}, @CorreoInstitucional={3}, @PuestoId={4}",
                id, e.CodigoEmpleado, e.NombreCompleto, e.CorreoInstitucional, (object)e.PuestoId ?? DBNull.Value);
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpleado(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarEmpleados @Accion='DELETE', @Id={0}", id);
            return NoContent();
        }
    }
}
