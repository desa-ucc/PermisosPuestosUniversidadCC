using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

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
        public async Task<IActionResult> GetComparativaHardware()
        {
            var data = await _context.Database.SqlQueryRaw<ComparativaEquipos>(
                "SELECT * FROM v_ComparativaEquipos"
            ).ToListAsync();

            return Ok(data);
        }
    }
}
