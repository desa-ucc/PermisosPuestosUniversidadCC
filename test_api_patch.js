const fs = require('fs');

let controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let content = fs.readFileSync(controllerPath, 'utf8');

const testEndpoint = `
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
`;

content = content.replace(
    /public async Task<IActionResult> GetMisPermisos\(\)/,
    testEndpoint + '\n        [HttpGet("mis-permisos")]\n        public async Task<IActionResult> GetMisPermisos()'
);

fs.writeFileSync(controllerPath, content);
console.log('Controller patched');
