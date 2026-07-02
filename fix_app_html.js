const fs = require('fs');

// Fix app.component.html AGAIN. The previous script didn't apply properly or failed silently.
let htmlContent = fs.readFileSync('src/src/app/app.component.html', 'utf8');

// I will re-apply the structural directives manually via script
htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/dashboard'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'DASHBOARD\', \'VER\')" [routerLink]="[\'/dashboard\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/catalogos'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'CATALOGOS\', \'VER\')" [routerLink]="[\'/catalogos\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/puestos'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'PUESTOS\', \'VER\')" [routerLink]="[\'/puestos\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/colaboradores'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'COLABORADORES\', \'VER\')" [routerLink]="[\'/colaboradores\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/hardware-ideal'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'EQUIPO_IDEAL\', \'VER\')" [routerLink]="[\'/hardware-ideal\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/hardware'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'HARDWARE\', \'VER\')" [routerLink]="[\'/hardware\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/software'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'SOFTWARE_LOCAL\', \'VER\')" [routerLink]="[\'/software\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/sitios'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'PERMISOS_SITIOS\', \'VER\')" [routerLink]="[\'/sitios\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/plataformas'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'PLATAFORMAS\', \'VER\')" [routerLink]="[\'/plataformas\']"'
);

htmlContent = htmlContent.replace(
  /<a \[routerLink\]="\['\/reportes'\]"/g,
  '<a *ngIf="permissionService.tienePermiso(\'REPORTES\', \'VER\')" [routerLink]="[\'/reportes\']"'
);

// Add Seguridad navigation
if (!htmlContent.includes("['/seguridad']")) {
  const seguridadNav = `
      <a *ngIf="permissionService.tienePermiso('SEGURIDAD', 'VER')" [routerLink]="['/seguridad']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">security</span>
        <span class="text-sm font-semibold">Seguridad y Acceso</span>
      </a>
`;

  htmlContent = htmlContent.replace(
    /<\/nav>/g,
    seguridadNav + '\n    </nav>'
  );
}

fs.writeFileSync('src/src/app/app.component.html', htmlContent);
console.log('App HTML fixed.');
