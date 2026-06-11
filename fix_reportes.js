const fs = require('fs');

const path = './src/src/app/components/reportes/reportes.component.ts';
let content = fs.readFileSync(path, 'utf8');

const toolbarHTML = `
            <!-- TOOLBAR DE FILTROS MAESTRA -->
            <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
              <span class="material-symbols-rounded text-ucc-primary">filter_list</span>
              <input type="text" placeholder="Filtrar Puesto..." class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
              <input type="text" placeholder="Filtrar Nombre..." class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
              <input type="text" placeholder="Filtrar Equipo..." class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
              <button class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
                <span class="material-symbols-rounded text-lg">refresh</span> Limpiar
              </button>
            </div>
`;

// Regex to replace the older toolbar
const toolbarRegex = /<!-- TOOLBAR DE FILTROS \(PLANTILLA MAESTRA\) -->[\s\S]*?<\/div>/g;
if (toolbarRegex.test(content)) {
    content = content.replace(toolbarRegex, toolbarHTML.trim());
}

fs.writeFileSync(path, content, 'utf8');
console.log('ReportesComponent updated.');
