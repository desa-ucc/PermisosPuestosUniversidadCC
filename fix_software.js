const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'components', 'software', 'software.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('public permissionService')) {
    content = content.replace('constructor(private api: ApiService, private fb: FormBuilder)', 'constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService)');
    content = content.replace('import { ApiService } from \'../../services/api.service\';', 'import { ApiService } from \'../../services/api.service\';\nimport { PermissionService } from \'../../services/permission.service\';');
}

// Fix crud buttons in table template
const replaceButtons = `
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button *ngIf="permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')" (click)="edit(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button *ngIf="permissionService.tienePermiso('SOFTWARE_LOCAL', 'ELIMINAR')" (click)="delete(sw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
`;

content = content.replace(/<div class="flex justify-center gap-3"><button \(click\)="verDetalle\(sw\)"[\s\S]*?<\/button><\/div>/g, replaceButtons.trim());

fs.writeFileSync(filePath, content);
console.log("software component updated");
