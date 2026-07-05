const fs = require('fs');

let content = fs.readFileSync('PermisosPuestosApi/Models/Models.cs', 'utf8');

// I also lost RolId in UsuarioDto
if (!content.includes('public int RolId { get; set; }')) {
    content = content.replace(
        /public string NombreRol \{ get; set; \} = string\.Empty;/g,
        'public string NombreRol { get; set; } = string.Empty;\n        public int RolId { get; set; }'
    );
    fs.writeFileSync('PermisosPuestosApi/Models/Models.cs', content);
    console.log('UsuarioDto patched');
}
