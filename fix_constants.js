const fs = require('fs');

// Fix app.component.html
let htmlContent = fs.readFileSync('src/src/app/app.component.html', 'utf8');

// Replace previous constants with the exact requested ones
htmlContent = htmlContent.replace(/permissionService\.tienePermiso\('HARDWARE_IDEAL', 'VER'\)/g, "permissionService.tienePermiso('EQUIPO_IDEAL', 'VER')");
htmlContent = htmlContent.replace(/permissionService\.tienePermiso\('SOFTWARE', 'VER'\)/g, "permissionService.tienePermiso('SOFTWARE_LOCAL', 'VER')");
htmlContent = htmlContent.replace(/permissionService\.tienePermiso\('SITIOS', 'VER'\)/g, "permissionService.tienePermiso('PERMISOS_SITIOS', 'VER')");

fs.writeFileSync('src/src/app/app.component.html', htmlContent);

// Fix seguridad.component.ts
let tsContent = fs.readFileSync('src/src/app/components/seguridad/seguridad.component.ts', 'utf8');
tsContent = tsContent.replace(
  /'DASHBOARD', 'PUESTOS', 'COLABORADORES', 'HARDWARE', 'HARDWARE_IDEAL',[\s\S]*?'SOFTWARE', 'SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'/g,
  "'DASHBOARD', 'PUESTOS', 'COLABORADORES', 'EQUIPO_IDEAL', 'HARDWARE', 'SOFTWARE_LOCAL', 'PERMISOS_SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'"
);

fs.writeFileSync('src/src/app/components/seguridad/seguridad.component.ts', tsContent);
console.log('Constants fixed.');
