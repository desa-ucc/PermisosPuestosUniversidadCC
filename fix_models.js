const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'Models', 'Models.cs');
let content = fs.readFileSync(filePath, 'utf8');

const permisoModel = `
    public class Permiso
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public string PantallaId { get; set; } = string.Empty;
        public bool PuedeCrear { get; set; }
        public bool PuedeEditar { get; set; }
        public bool PuedeEliminar { get; set; }
        public bool PuedeVer { get; set; }
    }
`;

if(!content.includes('public class Permiso')) {
    content = content.replace('public class Puesto', permisoModel + '\n    public class Puesto');
    fs.writeFileSync(filePath, content);
    console.log("Added Permiso to Models.cs");
}
