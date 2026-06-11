const fs = require('fs');

const path = './src/src/app/components/colaboradores/colaboradores.component.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /<tr class="bg-ucc-surface border-b border-ucc-neutral-outline\/20">[\s\S]*?<\/tr>/;

const newFilterRow = `<tr class="bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20">
            <td class="p-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-ucc-neutral-variant text-[18px]">filter_list</span>
                <input type="text" [(ngModel)]="filtroCodigo" placeholder="Código..." class="w-full bg-white border border-ucc-neutral-outline/50 rounded-md py-1.5 px-3 text-xs placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary outline-none transition-all">
              </div>
            </td>
            <td class="p-3"><input type="text" [(ngModel)]="filtroNombre" placeholder="Nombre..." class="w-full bg-white border border-ucc-neutral-outline/50 rounded-md py-1.5 px-3 text-xs placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary outline-none transition-all"></td>
            <td class="p-3"><input type="text" [(ngModel)]="filtroCorreo" placeholder="Correo..." class="w-full bg-white border border-ucc-neutral-outline/50 rounded-md py-1.5 px-3 text-xs placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary outline-none transition-all"></td>
            <td class="p-3"><input type="text" [(ngModel)]="filtroPuestoTabla" placeholder="Puesto..." class="w-full bg-white border border-ucc-neutral-outline/50 rounded-md py-1.5 px-3 text-xs placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary outline-none transition-all"></td>
            <td class="p-3 text-center">
              <div class="flex justify-center">
                <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                  <span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar
                </button>
              </div>
            </td>
          </tr>`;

content = content.replace(regex, newFilterRow);
fs.writeFileSync(path, content, 'utf8');

console.log('Update complete.');
