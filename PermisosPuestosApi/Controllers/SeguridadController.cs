using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles.FromSqlRaw("EXEC sp_GestionarRoles @Accion='LEER'").ToListAsync();
            return Ok(roles);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRol([FromBody] Rol rol)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='CREAR', @Nombre={0}, @Descripcion={1}",
                rol.Nombre, rol.Descripcion ?? (object)DBNull.Value);
            return Ok(new { message = "Rol creado exitosamente" });
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRol(int id, [FromBody] Rol rol)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='ACTUALIZAR', @Id={0}, @Nombre={1}, @Descripcion={2}",
                id, rol.Nombre, rol.Descripcion ?? (object)DBNull.Value);
            return Ok(new { message = "Rol actualizado exitosamente" });
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='ELIMINAR', @Id={0}", id);
            return Ok(new { message = "Rol eliminado exitosamente" });
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios.FromSqlRaw("EXEC sp_GestionarUsuarios @Accion='LEER'").ToListAsync();
            return Ok(usuarios);
        }

        [HttpPost("usuarios")]
        public async Task<IActionResult> CreateUsuario([FromBody] Usuario usuario)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='CREAR', @NombreUsuario={0}, @PasswordHash={1}, @Email={2}, @RolId={3}, @Activo={4}",
                usuario.NombreUsuario, usuario.PasswordHash, usuario.Email, usuario.RolId, usuario.Activo);
            return Ok(new { message = "Usuario creado exitosamente" });
        }

        [HttpPut("usuarios/{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] Usuario usuario)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='ACTUALIZAR', @Id={0}, @NombreUsuario={1}, @PasswordHash={2}, @Email={3}, @RolId={4}, @Activo={5}",
                id, usuario.NombreUsuario, usuario.PasswordHash ?? (object)DBNull.Value, usuario.Email, usuario.RolId, usuario.Activo);
            return Ok(new { message = "Usuario actualizado exitosamente" });
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='ELIMINAR', @Id={0}", id);
            return Ok(new { message = "Usuario eliminado exitosamente" });
        }

        [HttpGet("permisos/{rolId}")]
        public async Task<IActionResult> GetPermisos(int rolId)
        {
            var permisos = await _context.Permisos.FromSqlRaw(
                "EXEC sp_GestionarPermisos @Accion='LEER', @RoleId={0}", rolId).ToListAsync();
            return Ok(permisos);
        }

        [HttpPut("permisos")]
        public async Task<IActionResult> UpdatePermiso([FromBody] Permiso permiso)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisos @Accion='ACTUALIZAR', @RoleId={0}, @PantallaId={1}, @PuedeCrear={2}, @PuedeEditar={3}, @PuedeEliminar={4}, @PuedeVer={5}",
                permiso.RoleId, permiso.PantallaId, permiso.PuedeCrear, permiso.PuedeEditar, permiso.PuedeEliminar, permiso.PuedeVer);
            return Ok(new { message = "Permiso actualizado exitosamente" });
        }
    }
}
