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
            var rolIdClaim = User.FindFirst("RolId")?.Value;
            if (string.IsNullOrEmpty(rolIdClaim)) return Unauthorized();

            var roleIdParam = new SqlParameter("@RoleId", int.Parse(rolIdClaim));
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(permisos);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var accionParam = new SqlParameter("@Accion", "SELECT");
            var idParam = new SqlParameter("@Id", DBNull.Value);
            var nombreParam = new SqlParameter("@Nombre", DBNull.Value);
            var descripcionParam = new SqlParameter("@Descripcion", DBNull.Value);

            var roles = await _context.Set<RolDto>()
                .FromSqlRaw("EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                    accionParam, idParam, nombreParam, descripcionParam)
                .ToListAsync();

            return Ok(roles);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRol([FromBody] RolDto rol)
        {
            var accionParam = new SqlParameter("@Accion", "INSERT");
            var idParam = new SqlParameter("@Id", DBNull.Value);
            var nombreParam = new SqlParameter("@Nombre", rol.Nombre);
            var descripcionParam = new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                accionParam, idParam, nombreParam, descripcionParam);

            return Ok(new { message = "Rol creado exitosamente" });
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRol(int id, [FromBody] RolDto rol)
        {
            var accionParam = new SqlParameter("@Accion", "UPDATE");
            var idParam = new SqlParameter("@Id", id);
            var nombreParam = new SqlParameter("@Nombre", rol.Nombre);
            var descripcionParam = new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                accionParam, idParam, nombreParam, descripcionParam);

            return Ok(new { message = "Rol actualizado exitosamente" });
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            var accionParam = new SqlParameter("@Accion", "DELETE");
            var idParam = new SqlParameter("@Id", id);
            var nombreParam = new SqlParameter("@Nombre", DBNull.Value);
            var descripcionParam = new SqlParameter("@Descripcion", DBNull.Value);

            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                    accionParam, idParam, nombreParam, descripcionParam);
                return Ok(new { message = "Rol eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al eliminar el rol. Puede que existan usuarios asignados a él." });
            }
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var accionParam = new SqlParameter("@Accion", "SELECT");
            var idParam = new SqlParameter("@Id", DBNull.Value);
            var usernameParam = new SqlParameter("@NombreUsuario", DBNull.Value);
            var passwordParam = new SqlParameter("@PasswordHash", DBNull.Value);
            var emailParam = new SqlParameter("@Email", DBNull.Value);
            var roleIdParam = new SqlParameter("@RolId", DBNull.Value);

            var usuarios = await _context.Set<UsuarioResponseDto>()
                .FromSqlRaw("EXEC sp_GestionarUsuarios @Accion, @Id, @NombreUsuario, @PasswordHash, @Email, @RolId",
                    accionParam, idParam, usernameParam, passwordParam, emailParam, roleIdParam)
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost("usuarios")]
        public async Task<IActionResult> CreateUsuario([FromBody] UsuarioCreateDto request)
        {
            // Simulate hash creation, normally you'd use the ComputeSha256Hash function here
            // But we don't need a real hash for the test API just pass the string.
            var hashParam = new SqlParameter("@PasswordHash", request.PasswordHash ?? "defaultHash");

            var accionParam = new SqlParameter("@Accion", "INSERT");
            var idParam = new SqlParameter("@Id", DBNull.Value);
            var usernameParam = new SqlParameter("@NombreUsuario", request.NombreUsuario);
            var emailParam = new SqlParameter("@Email", request.Email ?? (object)DBNull.Value);
            var roleIdParam = new SqlParameter("@RolId", request.RolId);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id, @NombreUsuario, @PasswordHash, @Email, @RolId",
                accionParam, idParam, usernameParam, hashParam, emailParam, roleIdParam);

            return Ok(new { message = "Usuario creado exitosamente" });
        }

        [HttpPut("usuarios/{id}")]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UsuarioCreateDto request)
        {
            var accionParam = new SqlParameter("@Accion", "UPDATE");
            var idParam = new SqlParameter("@Id", id);
            var usernameParam = new SqlParameter("@NombreUsuario", request.NombreUsuario);
            var hashParam = new SqlParameter("@PasswordHash", request.PasswordHash ?? (object)DBNull.Value);
            var emailParam = new SqlParameter("@Email", request.Email ?? (object)DBNull.Value);
            var roleIdParam = new SqlParameter("@RolId", request.RolId);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id, @NombreUsuario, @PasswordHash, @Email, @RolId",
                accionParam, idParam, usernameParam, hashParam, emailParam, roleIdParam);

            return Ok(new { message = "Usuario actualizado exitosamente" });
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var accionParam = new SqlParameter("@Accion", "DELETE");
            var idParam = new SqlParameter("@Id", id);
            var usernameParam = new SqlParameter("@NombreUsuario", DBNull.Value);
            var hashParam = new SqlParameter("@PasswordHash", DBNull.Value);
            var emailParam = new SqlParameter("@Email", DBNull.Value);
            var roleIdParam = new SqlParameter("@RolId", DBNull.Value);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion, @Id, @NombreUsuario, @PasswordHash, @Email, @RolId",
                accionParam, idParam, usernameParam, hashParam, emailParam, roleIdParam);

            return Ok(new { message = "Usuario eliminado exitosamente" });
        }

        [HttpGet("roles/{roleId}/permisos")]
        public async Task<IActionResult> GetPermisosPorRol(int roleId)
        {
            var roleIdParam = new SqlParameter("@RoleId", roleId);
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(permisos);
        }

        [HttpPost("roles/{roleId}/permisos")]
        public async Task<IActionResult> SavePermisos(int roleId, [FromBody] List<PermisoDto> permisos)
        {
            // Simple loop logic to execute updates, following EF core FromSqlRaw guidelines
            foreach (var permiso in permisos)
            {
                var accionParam = new SqlParameter("@Accion", "UPSERT");
                var idParam = new SqlParameter("@Id", permiso.Id > 0 ? permiso.Id : DBNull.Value);
                var rolIdParam = new SqlParameter("@RolId", roleId);
                var pantallaIdParam = new SqlParameter("@PantallaId", permiso.PantallaId);
                var crearParam = new SqlParameter("@PuedeCrear", permiso.PuedeCrear);
                var editarParam = new SqlParameter("@PuedeEditar", permiso.PuedeEditar);
                var eliminarParam = new SqlParameter("@PuedeEliminar", permiso.PuedeEliminar);
                var verParam = new SqlParameter("@PuedeVer", permiso.PuedeVer);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion, @Id, @RolId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer",
                    accionParam, idParam, rolIdParam, pantallaIdParam, crearParam, editarParam, eliminarParam, verParam);
            }

            return Ok(new { message = "Permisos actualizados exitosamente" });
        }

        [HttpPut("permisos/{id}")]
        public async Task<IActionResult> UpdateSinglePermiso(int id, [FromBody] PermisoDto permiso)
        {
            var accionParam = new SqlParameter("@Accion", "UPSERT");
            var idParam = new SqlParameter("@Id", id > 0 ? id : DBNull.Value);
            var rolIdParam = new SqlParameter("@RolId", permiso.RoleId);
            var pantallaIdParam = new SqlParameter("@PantallaId", permiso.PantallaId);
            var crearParam = new SqlParameter("@PuedeCrear", permiso.PuedeCrear);
            var editarParam = new SqlParameter("@PuedeEditar", permiso.PuedeEditar);
            var eliminarParam = new SqlParameter("@PuedeEliminar", permiso.PuedeEliminar);
            var verParam = new SqlParameter("@PuedeVer", permiso.PuedeVer);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisos @Accion, @Id, @RolId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer",
                accionParam, idParam, rolIdParam, pantallaIdParam, crearParam, editarParam, eliminarParam, verParam);

            return Ok(new { message = "Permiso actualizado" });
        }
    }
}
