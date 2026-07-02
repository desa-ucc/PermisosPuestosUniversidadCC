using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

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
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(roleClaim) || string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            // Needs to get RoleId to fetch permissions. This means updating Login to provide RoleId in token or fetching here.
            // But since sp_ObtenerPermisosPorRol requires RoleId, let's execute a query to find RoleId by role name.

            // To be implemented...
            return Ok();
        }
    }
}
