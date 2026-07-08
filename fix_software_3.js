const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'components', 'software', 'software.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

const nuevoButton = `
        <div class="flex gap-3 mt-4">
          <button *ngIf="permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR') && currentId" type="submit" [disabled]="swForm.invalid" class="ucc-btn-primary flex items-center gap-2">
            <span class="material-symbols-outlined">save</span>
            Guardar Cambios
          </button>

          <button *ngIf="permissionService.tienePermiso('SOFTWARE_LOCAL', 'CREAR') && !currentId" type="submit" [disabled]="swForm.invalid" class="ucc-btn-primary flex items-center gap-2">
             <span class="material-symbols-outlined">save</span>
             Guardar
          </button>

          <button *ngIf="isEditing || isReadOnly" type="button" (click)="resetForm()" class="px-4 py-2 text-sm font-semibold text-ucc-primary border border-ucc-primary rounded-lg hover:bg-ucc-primary/10 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined">close</span>
            Cancelar
          </button>
        </div>
`;

// It seems there's a problem finding the right button logic, let's just make a simple replacement.
content = content.replace(/<button type="submit" \[disabled\]="swForm.invalid" class="ucc-btn-primary flex items-center gap-2">[\s\S]*?Guardar[\s\S]*?<\/button>/, `<button *ngIf="(isEditing ? permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR') : permissionService.tienePermiso('SOFTWARE_LOCAL', 'CREAR')) && !isReadOnly" type="submit" [disabled]="swForm.invalid" class="ucc-btn-primary flex items-center gap-2">
            <span class="material-symbols-outlined">save</span>
            {{isEditing ? 'Guardar Cambios' : 'Guardar'}}
          </button>`);


fs.writeFileSync(filePath, content);
console.log("software template creation logic updated");
