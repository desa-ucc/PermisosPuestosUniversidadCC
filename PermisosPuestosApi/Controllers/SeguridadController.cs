using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System.Text.Json;
using System.Data;

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

        // --- TEMPORAL: Endpoint para aplicar el parche a la BD ---
        [HttpGet("patch-db")]
        [AllowAnonymous]
        public async Task<IActionResult> PatchDb()
        {
            var sqlPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "update_sp_permisos.sql");
            var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
            await _context.Database.ExecuteSqlRawAsync(sql);
            return Ok("SP sp_GestionarPermisos actualizado correctamente");
        }

        // --- ROLES ---
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _context.Roles.FromSqlRaw(
                    "SELECT * FROM v_GestionarRoles ORDER BY Nombre"
                ).ToListAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los roles", error = ex.Message });
            }
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRol([FromBody] Rol rol)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                    new SqlParameter("@Accion", "INSERT"),
                    new SqlParameter("@Id", DBNull.Value),
                    new SqlParameter("@Nombre", rol.Nombre),
                    new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value)
                );
                return Ok(new { message = "Rol creado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el rol", error = ex.Message });
            }
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRol(int id, [FromBody] Rol rol)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id, @Nombre, @Descripcion",
                    new SqlParameter("@Accion", "UPDATE"),
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Nombre", rol.Nombre),
                    new SqlParameter("@Descripcion", rol.Descripcion ?? (object)DBNull.Value)
                );
                return Ok(new { message = "Rol actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el rol", error = ex.Message });
            }
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRol(int id)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarRoles @Accion, @Id",
                    new SqlParameter("@Accion", "DELETE"),
                    new SqlParameter("@Id", id)
                );
                return Ok(new { message = "Rol eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el rol. Es posible que esté asignado a un usuario.", error = ex.Message });
            }
        }

    [HttpGet("usuarios")]
    public async Task<IActionResult> GetUsuarios()
    {
        try
        {
            var usuarios = new List<UsuarioListDto>(); // Usa el nuevo DTO
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "select * from v_GestionarUsuarios";
                await _context.Database.OpenConnectionAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        usuarios.Add(new UsuarioListDto // Instancia el nuevo DTO
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("Id")),
                            NombreUsuario = reader.GetString(reader.GetOrdinal("NombreUsuario")),
                            Email = reader.IsDBNull(reader.GetOrdinal("Email")) ? "" : reader.GetString(reader.GetOrdinal("Email")),
                            NombreRol = reader.GetString(reader.GetOrdinal("NombreRol")),
                            RolId = reader.GetInt32(reader.GetOrdinal("RolId")),
                            Activo = reader.GetBoolean(reader.GetOrdinal("Activo"))
                        });
                    }
                }
            }
            return Ok(usuarios);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener usuarios", error = ex.Message });
        }
    }

    [HttpPost("usuarios")]
    public async Task<IActionResult> CreateUsuario([FromBody] UsuarioCreateDto usuario)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState); // Esto te dirá qué campo falta

        try
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='INSERT', @Nombre=@Nombre, @PasswordHash=@PasswordHash, @Email=@Email, @RolId=@RolId",
                new SqlParameter("@Nombre", usuario.NombreUsuario),
                new SqlParameter("@PasswordHash", usuario.PasswordHash ?? (object)DBNull.Value),
                new SqlParameter("@Email", usuario.Email),
                new SqlParameter("@RolId", usuario.RolId)
            );
            return Ok(new { message = "Usuario creado exitosamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al crear", error = ex.Message });
        }
    }
    [HttpPut("usuarios/{id}")]
    public async Task<IActionResult> UpdateUsuario(int id, [FromBody] Usuario usuario)
    {
        try
        {
            // Asegúrate de que los nombres aquí también coincidan con el SP
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarUsuarios @Accion='UPDATE', @Id=@Id, @Nombre=@Nombre, @Email=@Email, @RolId=@RolId",
                new SqlParameter("@Id", id),
                new SqlParameter("@Nombre", usuario.NombreUsuario),
                new SqlParameter("@Email", usuario.Email),
                new SqlParameter("@RolId", usuario.RolId)
            );
            return Ok(new { message = "Usuario actualizado exitosamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al actualizar el usuario", error = ex.Message });
        }
    }
        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
             try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarUsuarios @Accion='DELETE', @Id=@Id", new SqlParameter("@Id", id));
                return Ok(new { message = "Usuario eliminado exitosamente" });
            }
             catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al eliminar el usuario", error = ex.Message });
            }
        }

        // --- PERMISOS ---
        [HttpGet("permisos/{rolId}")]
        public async Task<IActionResult> GetPermisos(int rolId)
        {
            try
            {
                 var permisos = await _context.Permisos.FromSqlRaw(
                    "EXEC sp_GestionarPermisos @Accion, @Id, @RoleId",
                    new SqlParameter("@Accion", "SELECT"),
                    new SqlParameter("@Id", DBNull.Value),
                    new SqlParameter("@RoleId", (object)rolId ?? DBNull.Value)
                ).ToListAsync();
                return Ok(permisos);
            }
             catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al obtener los permisos", error = ex.Message });
            }
        }

        [HttpPut("permisos")]
        public async Task<IActionResult> UpdatePermiso([FromBody] Permiso permiso)
        {
            try
            {
                 await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion, @Id, @RoleId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer",
                    new SqlParameter("@Accion", "UPDATE"),
                    new SqlParameter("@Id", DBNull.Value),
                    new SqlParameter("@RoleId", (object)permiso.RoleId ?? DBNull.Value),
                    new SqlParameter("@PantallaId", permiso.PantallaId ?? (object)DBNull.Value),
                    new SqlParameter("@PuedeCrear", permiso.PuedeCrear),
                    new SqlParameter("@PuedeEditar", permiso.PuedeEditar),
                    new SqlParameter("@PuedeEliminar", permiso.PuedeEliminar),
                    new SqlParameter("@PuedeVer", permiso.PuedeVer));
                return Ok(new { message = "Permiso actualizado exitosamente" });
            }
             catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al actualizar el permiso", error = ex.Message });
            }
        }

        [HttpPost("roles/{roleId}/permisos")]
        public async Task<IActionResult> GuardarPermisos(int roleId, [FromBody] List<Permiso> permisos)
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonData = JsonSerializer.Serialize(permisos, options);

                // Logging for debug as requested
                Console.WriteLine("JSON Payload for SP: " + jsonData);

                var jsonParam = new SqlParameter("@JsonDataParam", System.Data.SqlDbType.NVarChar, -1) { Value = jsonData };
                var accionParam = new SqlParameter("@AccionParam", "BULK_UPDATE");

                // Execute SQL using explicitly mapped variable names to bypass sequential mapping issues
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion = @AccionParam, @JsonData = @JsonDataParam",
                    accionParam,
                    jsonParam
                );

                return Ok(new { message = "Permisos actualizados masivamente de forma exitosa" });
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al actualizar los permisos", error = ex.Message });
            }
        }
    }
}
