using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
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
            var roles = await _context.Roles.FromSqlRaw("EXEC sp_GestionarRoles @Accion", new SqlParameter("@Accion", "SELECT")).ToListAsync();
            return Ok(roles);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRol([FromBody] Rol rol)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='INSERT', @Nombre=@Nombre, @Descripcion=@Descripcion",
                new SqlParameter("@Nombre", rol.Nombre),
                new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value));
            return Ok(new { message = "Rol creado exitosamente" });
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRol(int id, [FromBody] Rol rol)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='UPDATE', @Id=@Id, @Nombre=@Nombre, @Descripcion=@Descripcion",
                new SqlParameter("@Id", id),
                new SqlParameter("@Nombre", rol.Nombre),
                new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value));
            return Ok(new { message = "Rol actualizado exitosamente" });
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion='DELETE', @Id=@Id", new SqlParameter("@Id", id));
            return Ok(new { message = "Rol eliminado exitosamente" });
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.UsuariosDto.FromSqlRaw("EXEC sp_GestionarUsuarios @Accion", new SqlParameter("@Accion", "SELECT")).ToListAsync();
            return Ok(usuarios);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        private async Task EjecutarSpUsuario(string accion, Usuario usuario, int? id = null)
        {
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@Accion", accion),
                new SqlParameter("@Id", id ?? (object)DBNull.Value),
                new SqlParameter("@Nombre", usuario.NombreUsuario ?? (object)DBNull.Value),
                new SqlParameter("@Email", usuario.Email ?? (object)DBNull.Value),
                new SqlParameter("@PasswordHash", usuario.PasswordHash ?? (object)DBNull.Value),
                new SqlParameter("@RolId", usuario.RolId == 0 ? (object)DBNull.Value : usuario.RolId)
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id, @Nombre, @Email, @PasswordHash, @RolId",
                parameters.ToArray());
        }

        [HttpPost("usuarios")]
        public async Task<IActionResult> CreateUsuario([FromBody] Usuario usuario)
        {
            if (!string.IsNullOrEmpty(usuario.PasswordHash))
            {
                usuario.PasswordHash = HashPassword(usuario.PasswordHash);
            }
            await EjecutarSpUsuario("INSERT", usuario);
            return Ok(new { message = "Usuario creado exitosamente" });
        }

        [HttpPut("usuarios/{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] Usuario usuario)
        {
            if (!string.IsNullOrEmpty(usuario.PasswordHash))
            {
                usuario.PasswordHash = HashPassword(usuario.PasswordHash);
            }
            await EjecutarSpUsuario("UPDATE", usuario, id);
            return Ok(new { message = "Usuario actualizado exitosamente" });
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            await EjecutarSpUsuario("DELETE", new Usuario(), id);
            return Ok(new { message = "Usuario eliminado exitosamente" });
        }

        [HttpGet("permisos/{rolId}")]
        public async Task<IActionResult> GetPermisos(int rolId)
        {
            var permisos = await _context.Permisos.FromSqlRaw(
                "EXEC sp_GestionarPermisos @Accion='SELECT', @RolId=@RolId", new SqlParameter("@RolId", rolId)).ToListAsync();
            return Ok(permisos);
        }

        [HttpPut("permisos")]
        public async Task<IActionResult> UpdatePermiso([FromBody] Permiso permiso)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisos @Accion='UPDATE', @RolId=@RolId, @PantallaId=@PantallaId, @PuedeCrear=@PuedeCrear, @PuedeEditar=@PuedeEditar, @PuedeEliminar=@PuedeEliminar, @PuedeVer=@PuedeVer",
                new SqlParameter("@RolId", permiso.RoleId),
                new SqlParameter("@PantallaId", permiso.PantallaId),
                new SqlParameter("@PuedeCrear", permiso.PuedeCrear),
                new SqlParameter("@PuedeEditar", permiso.PuedeEditar),
                new SqlParameter("@PuedeEliminar", permiso.PuedeEliminar),
                new SqlParameter("@PuedeVer", permiso.PuedeVer));
            return Ok(new { message = "Permiso actualizado exitosamente" });
        }
    }
}
