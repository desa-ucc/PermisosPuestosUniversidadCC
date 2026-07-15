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
            try
            {
                var roles = await _context.Roles
                    .FromSqlRaw("EXEC sp_GestionarRoles @Accion", new SqlParameter("@Accion", "SELECT"))
                    .ToListAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al cargar los roles.", error = ex.Message });
            }
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRol([FromBody] Rol rol)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Nombre=@Nombre, @Descripcion=@Descripcion",
                    new SqlParameter("@Accion", "INSERT"),
                    new SqlParameter("@Nombre", rol.Nombre),
                    new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value));
                return Ok(new { message = "Rol creado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al crear el rol.", error = ex.Message });
            }
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRol(int id, [FromBody] Rol rol)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id=@Id, @Nombre=@Nombre, @Descripcion=@Descripcion",
                    new SqlParameter("@Accion", "UPDATE"),
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Nombre", rol.Nombre),
                    new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value));
                return Ok(new { message = "Rol actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al actualizar el rol.", error = ex.Message });
            }
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id=@Id",
                    new SqlParameter("@Accion", "DELETE"),
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Rol eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al eliminar el rol.", error = ex.Message });
            }
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            try
            {
                var usuarios = await _context.UsuariosDto
                    .FromSqlRaw("EXEC sp_GestionarUsuarios @Accion", new SqlParameter("@Accion", "SELECT"))
                    .ToListAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al cargar los usuarios.", error = ex.Message });
            }
        }

        [HttpPost("usuarios")]
        public async Task<IActionResult> CreateUsuario([FromBody] Usuario usuario)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='INSERT', @NombreUsuario=@NombreUsuario, @PasswordHash=@PasswordHash, @Email=@Email, @RolId=@RolId, @Activo=@Activo",
                new SqlParameter("@NombreUsuario", usuario.NombreUsuario),
                new SqlParameter("@PasswordHash", usuario.PasswordHash),
                new SqlParameter("@Email", usuario.Email),
                new SqlParameter("@RolId", usuario.RolId),
                new SqlParameter("@Activo", usuario.Activo));
            return Ok(new { message = "Usuario creado exitosamente" });
        }

        [HttpPut("usuarios/{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] Usuario usuario)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='UPDATE', @Id=@Id, @NombreUsuario=@NombreUsuario, @PasswordHash=@PasswordHash, @Email=@Email, @RolId=@RolId, @Activo=@Activo",
                new SqlParameter("@Id", id),
                new SqlParameter("@NombreUsuario", usuario.NombreUsuario),
                new SqlParameter("@PasswordHash", usuario.PasswordHash ?? (object)DBNull.Value),
                new SqlParameter("@Email", usuario.Email),
                new SqlParameter("@RolId", usuario.RolId),
                new SqlParameter("@Activo", usuario.Activo));
            return Ok(new { message = "Usuario actualizado exitosamente" });
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='DELETE', @Id=@Id", new SqlParameter("@Id", id));
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
