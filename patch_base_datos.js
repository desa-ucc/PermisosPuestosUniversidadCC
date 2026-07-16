const fs = require('fs');

let code = fs.readFileSync('src/src/app/components/plataformas/plataformas.component.ts', 'utf8');

code = code.replace(/app-plataformas/g, 'app-base-datos');
code = code.replace(/PlataformasComponent/g, 'BaseDatosComponent');
code = code.replace(/Plataforma/g, 'AccesoBD');
code = code.replace(/plataformasNombres/g, 'servidores');
code = code.replace(/plataformas/g, 'accesosBD');
code = code.replace(/plataforma/g, 'accesoBD');
code = code.replace(/plat\./g, 'acbd.');
code = code.replace(/plat\)/g, 'acbd)');

code = code.replace(/Plataformas y Licencias/g, 'Base de Datos');
code = code.replace(/Detalles de Plataforma/g, 'Detalles de Base de Datos');
code = code.replace(/Editar Plataforma/g, 'Editar Base de Datos');
code = code.replace(/Registrar Plataforma/g, 'Registrar Base de Datos');
code = code.replace(/PLATAFORMAS/g, 'ADMINBASEDATOS');

// Fix api service calls
code = code.replace(/getAccesoBDNombres/g, 'getPlataformasNombres');
code = code.replace(/updateAccesoBD/g, 'updateAccesoBD');
code = code.replace(/createAccesoBD/g, 'createAccesoBD');
code = code.replace(/deleteAccesoBD/g, 'deleteAccesoBD');


fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Created base-datos.component.ts");
