const fs = require('fs');

const controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let content = fs.readFileSync(controllerPath, 'utf8');

const oldBlock = `        [HttpPost("roles/{roleId}/permisos")]
        public async Task<IActionResult> GuardarPermisos(int roleId, [FromBody] List<Permiso> permisos)
        {
            try
            {
                var jsonData = JsonSerializer.Serialize(permisos);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion=@Accion, @JsonData=@JsonData",
                    new SqlParameter("@Accion", "BULK_UPDATE"),
                    new SqlParameter("@JsonData", jsonData)
                );

                return Ok(new { message = "Permisos actualizados masivamente de forma exitosa" });
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al actualizar los permisos", error = ex.Message });
            }
        }`;

const newBlock = `        [HttpPost("roles/{roleId}/permisos")]
        public async Task<IActionResult> GuardarPermisos(int roleId, [FromBody] List<Permiso> permisos)
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var jsonData = JsonSerializer.Serialize(permisos, options);

                // Logging for debug as requested
                Console.WriteLine("JSON Payload for SP: " + jsonData);

                var jsonParam = new SqlParameter("@JsonData", System.Data.SqlDbType.NVarChar, -1) { Value = jsonData };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarPermisos @Accion, @Id, @RoleId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer, @JsonData",
                    new SqlParameter("@Accion", "BULK_UPDATE"),
                    new SqlParameter("@Id", DBNull.Value),
                    new SqlParameter("@RoleId", DBNull.Value),
                    new SqlParameter("@PantallaId", DBNull.Value),
                    new SqlParameter("@PuedeCrear", 0),
                    new SqlParameter("@PuedeEditar", 0),
                    new SqlParameter("@PuedeEliminar", 0),
                    new SqlParameter("@PuedeVer", 0),
                    jsonParam
                );

                return Ok(new { message = "Permisos actualizados masivamente de forma exitosa" });
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { message = "Error al actualizar los permisos", error = ex.Message });
            }
        }`;


if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(controllerPath, content, 'utf8');
  console.log('Controller JSON fix patched successfully');
} else {
  console.log('Could not find the target block to patch in Controller.');
}
