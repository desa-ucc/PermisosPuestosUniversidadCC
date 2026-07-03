const fs = require('fs');

let controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let content = fs.readFileSync(controllerPath, 'utf8');

if (!content.includes('ILogger<SeguridadController>')) {
    content = content.replace(
        /public SeguridadController\(AppDbContext context\)/,
        'private readonly ILogger<SeguridadController> _logger;\n\n        public SeguridadController(AppDbContext context, ILogger<SeguridadController> logger)'
    );

    content = content.replace(
        /        \{/,
        '        {\n            _logger = logger;'
    );

    content = content.replace(
        /        \[HttpGet\("mis-permisos"\)\]/,
        '        [HttpGet("mis-permisos")]'
    );

    content = content.replace(
        /var rolIdParam = new SqlParameter\("@RoleId", rolId\);/,
        '_logger.LogInformation("Ejecutando sp_ObtenerPermisosPorRol para el usuario...");\n\n            var rolIdParam = new SqlParameter("@RoleId", rolId);'
    );

    fs.writeFileSync(controllerPath, content);
    console.log('Backend patched with logger');
}
