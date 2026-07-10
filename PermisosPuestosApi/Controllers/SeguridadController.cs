using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SeguridadController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SeguridadController(AppDbContext context) { _context = context; }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Set<RolDto>().FromSqlRaw("EXEC sp_GetRoles").ToListAsync();
            return Ok(roles);
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.UsuariosDto.FromSqlRaw("EXEC sp_GetUsuarios").ToListAsync();
            return Ok(usuarios);
        }

        [HttpPut("usuarios/{id}/rol")]
        public async Task<IActionResult> UpdateUsuarioRol(int id, [FromBody] int rolId)
        {
            var pId = new SqlParameter("@Id", id);
            var pRolId = new SqlParameter("@RolId", rolId);

            await _context.Database.ExecuteSqlRawAsync("EXEC sp_GestionarUsuarios @Accion='UPDATE_ROLE', @Id=@Id, @RolId=@RolId", pId, pRolId);

            return Ok();
        }

        [HttpGet("roles/{roleId}/permisos")]
        public async Task<IActionResult> GetPermisosPorRol(int roleId)
        {
            var p = new SqlParameter("@RoleId", roleId);
            var permisos = await _context.Set<PermisoDto>().FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", p).ToListAsync();
            return Ok(permisos);
        }

        [HttpPost("permisos")]
        public async Task<IActionResult> GestionarPermiso([FromBody] PermisoDto p)
        {
            // Determine Action (CREATE if Id is 0/null, UPDATE otherwise)
            var action = p.Id > 0 ? "UPDATE" : "CREATE";

            var pAction = new SqlParameter("@Action", action);
            var pId = new SqlParameter("@Id", p.Id);
            var pRoleId = new SqlParameter("@RoleId", p.RoleId);
            var pPantalla = new SqlParameter("@PantallaId", p.PantallaId);
            var pCrear = new SqlParameter("@PuedeCrear", p.PuedeCrear);
            var pEditar = new SqlParameter("@PuedeEditar", p.PuedeEditar);
            var pEliminar = new SqlParameter("@PuedeEliminar", p.PuedeEliminar);
            var pVer = new SqlParameter("@PuedeVer", p.PuedeVer);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisos @Accion=@Action, @Id=@Id, @RoleId=@RoleId, @PantallaId=@PantallaId, @PuedeCrear=@PuedeCrear, @PuedeEditar=@PuedeEditar, @PuedeEliminar=@PuedeEliminar, @PuedeVer=@PuedeVer",
                pAction, pId, pRoleId, pPantalla, pCrear, pEditar, pEliminar, pVer);

            return Ok();
        }
    }
}
