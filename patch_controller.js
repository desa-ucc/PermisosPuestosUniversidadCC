const fs = require('fs');

const controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let content = fs.readFileSync(controllerPath, 'utf8');

const oldGetPermisosBlock = `        [HttpGet("permisos/{rolId}")]
        public async Task<IActionResult> GetPermisos(int rolId)
        {
            try
            {
                 var permisos = await _context.Permisos.FromSqlRaw(
                    "EXEC sp_GestionarPermisos @Accion='SELECT', @RolId=@RolId", new SqlParameter("@RolId", rolId)).ToListAsync();
                return Ok(permisos);
            }
             catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al obtener los permisos", error = ex.Message });
            }
        }`;

const newGetPermisosBlock = `        [HttpGet("permisos/{rolId}")]
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
        }`;

const oldUpdatePermisoBlock = `        [HttpPut("permisos")]
        public async Task<IActionResult> UpdatePermiso([FromBody] Permiso permiso)
        {
            try
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
             catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al actualizar el permiso", error = ex.Message });
            }
        }`;

const newUpdatePermisoBlock = `        [HttpPut("permisos")]
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
        }`;


if (content.includes(oldGetPermisosBlock) && content.includes(oldUpdatePermisoBlock)) {
  content = content.replace(oldGetPermisosBlock, newGetPermisosBlock);
  content = content.replace(oldUpdatePermisoBlock, newUpdatePermisoBlock);
  fs.writeFileSync(controllerPath, content, 'utf8');
  console.log('Controller patched successfully');
} else {
  console.log('Could not find the target blocks to patch in Controller.');
}
