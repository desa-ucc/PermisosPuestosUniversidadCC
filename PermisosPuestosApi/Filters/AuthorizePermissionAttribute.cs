using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System.Security.Claims;
using Microsoft.Data.SqlClient;

namespace PermisosPuestosApi.Filters
{
    public class AuthorizePermissionAttribute : TypeFilterAttribute
    {
        public AuthorizePermissionAttribute(string pantallaId, string accion)
            : base(typeof(AuthorizePermissionFilter))
        {
            Arguments = new object[] { pantallaId, accion };
        }
    }

    public class AuthorizePermissionFilter : IAsyncActionFilter
    {
        private readonly string _pantallaId;
        private readonly string _accion;
        private readonly AppDbContext _context;

        public AuthorizePermissionFilter(string pantallaId, string accion, AppDbContext context)
        {
            _pantallaId = pantallaId;
            _accion = accion.ToUpper();
            _context = context;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var user = context.HttpContext.User;
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var rolIdClaim = user.FindFirst("RolId");
            if (rolIdClaim == null || !int.TryParse(rolIdClaim.Value, out int rolId))
            {
                context.Result = new ForbidResult();
                return;
            }

            var roleIdParam = new SqlParameter("@RoleId", rolId);
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            var permisoPantalla = permisos.FirstOrDefault(p => p.PantallaId.Equals(_pantallaId, StringComparison.OrdinalIgnoreCase));
            if (permisoPantalla == null)
            {
                context.Result = new ForbidResult();
                return;
            }

            bool hasPermission = _accion switch
            {
                "CREAR" => permisoPantalla.PuedeCrear,
                "EDITAR" => permisoPantalla.PuedeEditar,
                "ELIMINAR" => permisoPantalla.PuedeEliminar,
                "VER" => permisoPantalla.PuedeVer,
                _ => false
            };

            if (!hasPermission)
            {
                context.Result = new ForbidResult();
                return;
            }

            await next();
        }
    }
}
