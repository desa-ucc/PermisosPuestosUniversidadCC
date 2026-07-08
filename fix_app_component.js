const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'app.component.html');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement logic:
const replacements = [
  { text: `<a [routerLink]="['/dashboard']"`, screen: 'DASHBOARD' },
  { text: `<a [routerLink]="['/catalogos']"`, screen: 'CATALOGOS' }, // Using CATALOGOS even though it's not strictly in memory, maybe SEGURIDAD or others? Let's check memory: 'DASHBOARD', 'PUESTOS', 'COLABORADORES', 'EQUIPO_IDEAL', 'HARDWARE', 'SOFTWARE_LOCAL', 'PERMISOS_SITIOS', 'PLATAFORMAS', 'REPORTES', and 'SEGURIDAD'
  { text: `<a [routerLink]="['/puestos']"`, screen: 'PUESTOS' },
  { text: `<a [routerLink]="['/colaboradores']"`, screen: 'COLABORADORES' },
  { text: `<a [routerLink]="['/hardware-ideal']"`, screen: 'EQUIPO_IDEAL' },
  { text: `<a [routerLink]="['/hardware']"`, screen: 'HARDWARE' },
  { text: `<a [routerLink]="['/software']"`, screen: 'SOFTWARE_LOCAL' },
  { text: `<a [routerLink]="['/sitios']"`, screen: 'PERMISOS_SITIOS' },
  { text: `<a [routerLink]="['/plataformas']"`, screen: 'PLATAFORMAS' },
  { text: `<a [routerLink]="['/reportes']"`, screen: 'REPORTES' }
];

replacements.forEach(r => {
    // For catalogos I'll use SEGURIDAD as per memory or maybe just skip it if it's not strictly one of them, but let's use SEGURIDAD since it usually manages that, or we can just leave it if it's admin only, actually let's use a dynamic approach
    let screenId = r.screen;
    if (r.screen === 'CATALOGOS') {
        screenId = 'SEGURIDAD'; // Best match from the memory catalog
    }
    content = content.replace(r.text, `<a *ngIf="permissionService.tienePermiso('${screenId}', 'VER')" [routerLink]="['${r.text.match(/\['(.*)'\]/)[1]}']"`);
});

fs.writeFileSync(filePath, content);
console.log("Done");
