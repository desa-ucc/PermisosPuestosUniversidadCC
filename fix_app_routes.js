const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'app.routes.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(`import { AuthGuard } from './guards/auth.guard';`, `import { AuthGuard } from './guards/auth.guard';\nimport { RoleGuard } from './guards/role.guard';`);

const routeData = {
    'dashboard': "data: { pantallaId: 'DASHBOARD' }",
    'catalogos': "data: { pantallaId: 'SEGURIDAD' }",
    'puestos': "data: { pantallaId: 'PUESTOS' }",
    'colaboradores': "data: { pantallaId: 'COLABORADORES' }",
    'hardware': "data: { pantallaId: 'HARDWARE' }",
    'hardware-ideal': "data: { pantallaId: 'EQUIPO_IDEAL' }",
    'software': "data: { pantallaId: 'SOFTWARE_LOCAL' }",
    'sitios': "data: { pantallaId: 'PERMISOS_SITIOS' }",
    'plataformas': "data: { pantallaId: 'PLATAFORMAS' }",
    'reportes': "data: { pantallaId: 'REPORTES' }"
};

Object.keys(routeData).forEach(route => {
    const pattern = new RegExp(`{ path: '${route}', component: (.*?), canActivate: \\[AuthGuard\\] }`);
    content = content.replace(pattern, `{ path: '${route}', component: $1, canActivate: [AuthGuard, RoleGuard], ${routeData[route]} }`);
});

fs.writeFileSync(filePath, content);
console.log("Routes updated");
