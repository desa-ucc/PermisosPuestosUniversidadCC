using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using System.Threading.Tasks;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ComparativasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComparativasController(AppDbContext context)
        {
            _context = context;
        }



        [HttpGet("hardware")]
        public async Task<IActionResult> GetHardware()
        {
            try
            {
                var data = await _context.Database.SqlQueryRaw<ComparativaHardwareDto>(
                    "SELECT Empleado, CodigoPuesto, Puesto, IdealTipo, IdealProcesador, IdealMemoria, IdealDiscoDuro, IdealMarca, AsignadoTipo, AsignadoProcesador, AsignadoMemoria, ActualDiscoDuro AS AsignadoDiscoDuro, ActualMarca AS AsignadoMarca FROM v_ComparativaEquipos"
                ).ToListAsync();

                return Ok(data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error al obtener la comparativa: {ex.Message}");
            }
        }
    }

    public class ComparativaHardwareDto
    {
        public string? Empleado { get; set; }
        public string? CodigoPuesto { get; set; }
        public string? Puesto { get; set; }
        public string? IdealTipo { get; set; }
        public string? IdealProcesador { get; set; }
        public string? IdealMemoria { get; set; }
        public string? AsignadoTipo { get; set; }
        public string? AsignadoProcesador { get; set; }
        public string? AsignadoMemoria { get; set; }
        public string? IdealDiscoDuro { get; set; }
        public string? IdealMarca { get; set; }
        public string? AsignadoDiscoDuro { get; set; }
        public string? AsignadoMarca { get; set; }
    }
}
