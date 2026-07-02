const fs = require('fs');

let content = fs.readFileSync('PermisosPuestosApi/Models/Models.cs', 'utf8');

// I seem to have lost the `Rol` and `Permiso` classes during my previous scripts, let me add them back properly.
if (!content.includes('public class Rol')) {
    const classesToAdd = `
    public class Rol
    {
        [Key] public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }

    public class Permiso
    {
        [Key] public int Id { get; set; }
        public int RoleId { get; set; }
        public string PantallaId { get; set; } = string.Empty;
        public bool PuedeCrear { get; set; }
        public bool PuedeEditar { get; set; }
        public bool PuedeEliminar { get; set; }
        public bool PuedeVer { get; set; }
    }
`;
    content = content.replace(
        /public class LoginRequest/g,
        classesToAdd + '\n    public class LoginRequest'
    );
    fs.writeFileSync('PermisosPuestosApi/Models/Models.cs', content);
    console.log('Models patched');
}
