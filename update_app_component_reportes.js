const fs = require('fs');

let content = fs.readFileSync('src/src/app/app.component.html', 'utf8');

// Insert after Plataformas in the sidebar
content = content.replace(
  /<a \[routerLink\]="\['\/plataformas'\]"[^>]*>\s*<span class="material-symbols-outlined">cloud_done<\/span>\s*<span class="text-sm font-semibold">Plataformas<\/span>\s*<\/a>/,
  `$&
      <a [routerLink]="['/reportes']" routerLinkActive="bg-ucc-primary-container/20 border-l-4 border-ucc-primary-container text-white" class="flex items-center gap-4 text-white/70 hover:text-white hover:bg-ucc-neutral-outline/10 py-3 px-6 transition-all rounded-lg">
        <span class="material-symbols-outlined">analytics</span>
        <span class="text-sm font-semibold">Reportes</span>
      </a>`
);

fs.writeFileSync('src/src/app/app.component.html', content);
