const fs = require('fs');

// The DB Context error says AppDbContext doesn't have Permisos. Let's check it.
let content = fs.readFileSync('PermisosPuestosApi/Data/AppDbContext.cs', 'utf8');
if (!content.includes('public DbSet<Permiso> Permisos')) {
    content = content.replace(
        /public DbSet<UsuarioDto> UsuariosDto \{ get; set; \}/,
        'public DbSet<UsuarioDto> UsuariosDto { get; set; }\n        public DbSet<Rol> Roles { get; set; }\n        public DbSet<Permiso> Permisos { get; set; }'
    );
    fs.writeFileSync('PermisosPuestosApi/Data/AppDbContext.cs', content);
    console.log('AppDbContext patched');
}

let controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');
// Fix the routing warning issue where mis-permisos exists twice
// I'll rewrite the file safely.
