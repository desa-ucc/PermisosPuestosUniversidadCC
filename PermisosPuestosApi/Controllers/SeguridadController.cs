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

        private readonly ILogger<SeguridadController> _logger;

        public SeguridadController(AppDbContext context, ILogger<SeguridadController> logger)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("test-permisos")]
        [AllowAnonymous]
        public async Task<IActionResult> TestPermisos()
        {
            var roleIdParam = new SqlParameter("@RoleId", 1);
            var permisos = await _context.Permisos
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();
            return Ok(permisos);
        }

        [HttpGet("mis-permisos")]
        public async Task<IActionResult> GetMisPermisos()
        {
            _logger.LogInformation("--- Petición recibida en /mis-permisos ---");
            _logger.LogInformation("Headers de la petición: {Headers}", Request.Headers["Authorization"]);
            _logger.LogInformation("Cantidad de Claims: {Count}", User.Claims.Count());

            var rolIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RolId")?.Value;

            if (string.IsNullOrEmpty(rolIdClaim) || !int.TryParse(rolIdClaim, out int rolId))
                return Unauthorized();

            _logger.LogInformation("Ejecutando sp_ObtenerPermisosPorRol para el usuario...");

            var rolIdParam = new SqlParameter("@RoleId", rolId);

            var permisos = await _context.Permisos
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", rolIdParam)
                .ToListAsync();

            return Ok(permisos);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var accionParam = new SqlParameter("@Accion", "READ");

            var roles = await _context.Roles
                .FromSqlRaw("EXEC sp_GestionarRoles @Accion", accionParam)
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var accionParam = new SqlParameter("@Accion", "READ");

            var usuarios = await _context.UsuariosDto
                .FromSqlRaw("EXEC sp_GestionarUsuarios @Accion", accionParam)
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost("usuarios")]
        public async Task<IActionResult> CreateUsuario([FromBody] UsuarioDto request)
        {
            var accionParam = new SqlParameter("@Accion", "CREATE");
            var nombreParam = new SqlParameter("@NombreUsuario", request.NombreUsuario);
            var pwdParam = new SqlParameter("@PasswordHash", request.PasswordHash ?? "default");
            var emailParam = new SqlParameter("@Email", request.NombreUsuario + "@ucc.edu");
            var rolParam = new SqlParameter("@RolId", request.RolId);
            var activoParam = new SqlParameter("@Activo", 1);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, NULL, @NombreUsuario, @PasswordHash, @Email, @RolId, @Activo",
                accionParam, nombreParam, pwdParam, emailParam, rolParam, activoParam);

            return Ok();
        }

        [HttpPut("usuarios/{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UsuarioDto request)
        {
            var accionParam = new SqlParameter("@Accion", "UPDATE");
            var idParam = new SqlParameter("@Id", id);
            var nombreParam = new SqlParameter("@NombreUsuario", (object?)request.NombreUsuario ?? DBNull.Value);
            var pwdParam = new SqlParameter("@PasswordHash", DBNull.Value);
            var emailParam = new SqlParameter("@Email", DBNull.Value);
            var rolParam = new SqlParameter("@RolId", request.RolId);
            var activoParam = new SqlParameter("@Activo", 1);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id, @NombreUsuario, @PasswordHash, @Email, @RolId, @Activo",
                accionParam, idParam, nombreParam, pwdParam, emailParam, rolParam, activoParam);

            return Ok();
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var accionParam = new SqlParameter("@Accion", "DELETE");
            var idParam = new SqlParameter("@Id", id);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id",
                accionParam, idParam);

            return Ok();
        }

        [HttpGet("roles/{id}/permisos")]
        public async Task<IActionResult> GetPermisosPorRol(int id)
        {
            var roleIdParam = new SqlParameter("@RoleId", id);

            var permisos = await _context.Permisos
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(permisos);
        }

        [HttpPost("roles/{id}/permisos")]
        public async Task<IActionResult> SavePermisosPorRol(int id, [FromBody] List<Permiso> permisos)
        {
            foreach (var p in permisos)
            {
                var accionParam = new SqlParameter("@Accion", p.Id > 0 ? "UPDATE" : "CREATE");
                var idParam = new SqlParameter("@Id", p.Id > 0 ? p.Id : DBNull.Value);
                var roleIdParam = new SqlParameter("@RoleId", id);
                var pantallaParam = new SqlParameter("@PantallaId", p.PantallaId);
                var crearParam = new SqlParameter("@PuedeCrear", p.PuedeCrear);
                var editarParam = new SqlParameter("@PuedeEditar", p.PuedeEditar);
                var eliminarParam = new SqlParameter("@PuedeEliminar", p.PuedeEliminar);
                var verParam = new SqlParameter("@PuedeVer", p.PuedeVer);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion, @Id, @RoleId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer",
                    accionParam, idParam, roleIdParam, pantallaParam, crearParam, editarParam, eliminarParam, verParam);
            }

            return Ok();
        }
    }
}
