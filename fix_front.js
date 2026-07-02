const fs = require('fs');
// Let's add console log in PermissionService to debug the problem
let content = fs.readFileSync('src/src/app/services/permission.service.ts', 'utf8');

content = content.replace(
    /tap\(permisos => \{/g,
    'tap(permisos => {\n        console.log("PERMISOS DEL USUARIO LOGUEADO DESDE API:", permisos);'
);

fs.writeFileSync('src/src/app/services/permission.service.ts', content);
