using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System.Security.Claims;

namespace PermisosPuestosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SeguridadController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeguridadController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("mis-permisos")]
        public async Task<IActionResult> GetMisPermisos()
        {
            try
            {
                var rolIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RolId");

                if (rolIdClaim == null)
                {
                    return Unauthorized(new { message = "Token inválido: No se encontró el RolId." });
                }

                int roleId = int.Parse(rolIdClaim.Value);

                var roleIdParam = new SqlParameter("@RoleId", roleId);

                var permisos = await _context.Permisos
                    .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                    .ToListAsync();

                return Ok(permisos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al obtener permisos", error = ex.Message });
            }
        }
    }
}
