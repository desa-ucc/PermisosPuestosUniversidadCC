const fs = require('fs');
let code = fs.readFileSync('src/src/app/app.component.html', 'utf8');

if (!code.includes('Base de Datos')) {
    const searchStr = `
          @if(permissionService.tienePermiso('PLATAFORMAS', 'VER')) {
            <a routerLink="/plataformas" routerLinkActive="bg-ucc-primary/10 text-ucc-primary font-semibold" class="flex items-center gap-3 px-4 py-3 rounded-lg text-ucc-neutral transition-all hover:bg-ucc-surface-container-low">
              <span class="material-symbols-outlined text-[20px]">api</span>
              <span>Plataformas</span>
            </a>
          }`;

    const replaceStr = searchStr + `
          @if(permissionService.tienePermiso('ADMINBASEDATOS', 'VER')) {
            <a routerLink="/base-datos" routerLinkActive="bg-ucc-primary/10 text-ucc-primary font-semibold" class="flex items-center gap-3 px-4 py-3 rounded-lg text-ucc-neutral transition-all hover:bg-ucc-surface-container-low">
              <span class="material-symbols-outlined text-[20px]">database</span>
              <span>Base de Datos</span>
            </a>
          }`;

    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('src/src/app/app.component.html', code);
    console.log("Updated app.component.html");
}
