const fs = require('fs');

const htmlPath = 'src/src/app/components/seguridad/seguridad.component.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// The block to replace
const originalBlock = `      <div class="mb-6 flex items-center gap-4">
        <label class="font-semibold text-secondary">Seleccione un Rol:</label>
        <select [(ngModel)]="rolSeleccionadoId" (change)="cargarPermisosRol()" class="form-select block w-64 rounded-md border-gray-300 shadow-sm focus:border-ucc-primary focus:ring focus:ring-ucc-primary/50">
          <option [ngValue]="null">-- Seleccionar Rol --</option>
          @for (rol of roles; track rol.id) {
            <option [value]="rol.id">{{rol.nombre}}</option>
          }
        </select>
      </div>

      @if (rolSeleccionadoId) {
        <div class="grid grid-cols-5 gap-4 bg-surface-container-highest p-3 rounded-t-lg border-b border-outline-variant/20">
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider pl-2">Pantalla</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Ver</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Crear</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Editar</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Eliminar</div>
        </div>

        <div class="bg-white">
          @for (permiso of permisosActuales; track permiso.pantallaId) {
            <div class="grid grid-cols-5 gap-4 items-center p-3 border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
              <div class="font-body-md font-bold text-secondary pl-2">{{permiso.pantallaId}}</div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeVer" (change)="actualizarPermiso(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeCrear" (change)="actualizarPermiso(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeEditar" (change)="actualizarPermiso(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeEliminar" (change)="actualizarPermiso(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
            </div>
          }
        </div>
      } @else {`;

const newBlock = `      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <label class="font-semibold text-secondary">Seleccione un Rol:</label>
          <select [(ngModel)]="rolSeleccionadoId" (change)="cargarPermisosRol()" class="form-select block w-64 rounded-md border-gray-300 shadow-sm focus:border-ucc-primary focus:ring focus:ring-ucc-primary/50">
            <option [ngValue]="null">-- Seleccionar Rol --</option>
            @for (rol of roles; track rol.id) {
              <option [value]="rol.id">{{rol.nombre}}</option>
            }
          </select>
        </div>

        @if (hasUnsavedChanges) {
          <button (click)="guardarPermisosMatriz()" class="ucc-btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg animate-pulse shadow-lg">
            <span class="material-symbols-outlined text-[18px]">save</span> Guardar Cambios
          </button>
        }
      </div>

      @if (rolSeleccionadoId) {
        <div class="grid grid-cols-5 gap-4 bg-surface-container-highest p-3 rounded-t-lg border-b border-outline-variant/20">
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider pl-2">Pantalla</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Ver</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Crear</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Editar</div>
          <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Eliminar</div>
        </div>

        <div class="bg-white">
          @for (permiso of permisosActuales; track permiso.pantallaId) {
            <div class="grid grid-cols-5 gap-4 items-center p-3 border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
              <div class="font-body-md font-bold text-secondary pl-2">{{permiso.pantallaId}}</div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeVer" (change)="marcarComoModificado()" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeCrear" (change)="marcarComoModificado()" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeEditar" (change)="marcarComoModificado()" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
              <div class="flex justify-center"><input type="checkbox" [(ngModel)]="permiso.puedeEliminar" (change)="marcarComoModificado()" class="form-checkbox h-5 w-5 text-ucc-primary rounded"></div>
            </div>
          }
        </div>
      } @else {`;

if (content.includes(originalBlock)) {
  content = content.replace(originalBlock, newBlock);
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log('HTML patched successfully');
} else {
  console.log('Could not find the target block to patch in HTML.');
}
