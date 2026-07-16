const fs = require('fs');
let code = fs.readFileSync('PermisosPuestosApi/Controllers/TempDbController.cs', 'utf8');

if (!code.includes('INSERT INTO pt_Permisos (RolId, Pantalla, CanRead, CanWrite, CanDelete)')) {
    code = code.replace(
        `EXEC('
CREATE OR ALTER PROCEDURE sp_GestionarAccesosBD`,
        `INSERT INTO pt_Permisos (RolId, Pantalla, CanRead, CanWrite, CanDelete)
SELECT Id, ''ADMINBASEDATOS'', 1, 1, 1 FROM pt_Roles WHERE NOT EXISTS (SELECT 1 FROM pt_Permisos p2 WHERE p2.RolId = Id AND p2.Pantalla = ''ADMINBASEDATOS'');

EXEC('
CREATE OR ALTER PROCEDURE sp_GestionarAccesosBD`
    );

    fs.writeFileSync('PermisosPuestosApi/Controllers/TempDbController.cs', code);
    console.log("Updated TempDbController.cs");
}
