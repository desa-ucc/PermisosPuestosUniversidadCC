import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionService, Permiso } from '../../services/permission.service';
import { PermisoDirective } from '../../directives/permiso.directive';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermisoDirective],
  template: `
<main class="p-gutter max-w-container-max-width mx-auto space-y-8">
  <!-- Heading -->
  <div class="mb-8">
    <h2 class="font-headline-lg text-headline-lg text-secondary">Gestión de Seguridad (RBAC)</h2>
    <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
      Administre los roles, usuarios y la matriz de permisos de acceso al sistema.
    </p>
  </div>

  <div class="bg-surface-container-low rounded-xl card-shadow border border-outline-variant/20 overflow-hidden relative">

    <!-- Toolbar de Filtros Estándar (Roles) -->
    <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
      <span class="material-symbols-outlined text-ucc-neutral-variant" data-icon="filter_list">filter_list</span>
      <input type="text" placeholder="Filtrar por Rol..." [(ngModel)]="filtrosRoles.nombre" (input)="aplicarFiltrosRoles()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
      <button (click)="limpiarFiltrosRoles()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
        <span class="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span> Limpiar Filtros
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="ucc-table">
        <thead>
          <tr>
            <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-left w-1/4">ID</th>
            <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-left w-1/2">Nombre del Rol</th>
            <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase w-1/4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for(rol of rolesFiltrados; track rol.id) {
            <tr class="hover:bg-surface-container-lowest transition-colors">
              <td class="py-4 px-6 font-body-md text-body-md font-bold text-secondary">{{rol.id}}</td>
              <td class="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{{rol.nombre}}</td>
              <td class="py-4 px-6">
                <div class="flex justify-center gap-3">
                  <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'EDITAR'}" (click)="abrirModalPermisos(rol)" class="ucc-btn-primary flex items-center gap-2 px-3 py-1 text-sm rounded-full">
                    <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span> Editar Permisos
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="py-8 px-6 text-center font-body-md text-on-surface-variant">No hay roles registrados.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Modal de Edición de Permisos -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        <!-- Header del Modal -->
        <div class="flex justify-between items-center p-6 border-b border-outline-variant/20 bg-secondary">
          <h3 class="font-title-lg text-title-lg text-white">Editar Permisos: {{rolSeleccionado?.nombre}}</h3>
          <button (click)="cerrarModal()" class="text-white hover:text-white/70 transition-colors">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="p-6 overflow-y-auto bg-surface-container-low flex-1">
          <div class="grid grid-cols-1 gap-4">
            <!-- Encabezados Grid -->
            <div class="grid grid-cols-5 gap-4 bg-surface-container-highest p-3 rounded-t-lg border-b border-outline-variant/20">
              <div class="font-label-md font-bold text-secondary uppercase tracking-wider pl-2">Pantalla</div>
              <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Crear</div>
              <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Editar</div>
              <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Eliminar</div>
              <div class="font-label-md font-bold text-secondary uppercase tracking-wider text-center">Ver</div>
            </div>

            <!-- Filas Grid -->
            @for(permiso of permisosActuales; track permiso.pantallaId) {
              <div class="grid grid-cols-5 gap-4 items-center p-3 border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                <div class="font-body-md font-bold text-secondary pl-2">{{permiso.pantallaId}}</div>

                <div class="flex justify-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="permiso.puedeCrear" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                  </label>
                </div>

                <div class="flex justify-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="permiso.puedeEditar" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                  </label>
                </div>

                <div class="flex justify-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="permiso.puedeEliminar" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                  </label>
                </div>

                <div class="flex justify-center">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="permiso.puedeVer" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                  </label>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="flex justify-end gap-3 p-4 border-t border-outline-variant/20 bg-surface">
          <button (click)="cerrarModal()" class="ucc-btn-secondary px-6">Cancelar</button>
          <button (click)="guardarPermisos()" class="ucc-btn-primary px-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span> Guardar Cambios
          </button>
        </div>

      </div>
    </div>

  </div>
</main>
  `
})
export class SeguridadComponent implements OnInit {
  // Data
  roles: any[] = [];
  rolesFiltrados: any[] = [];
  filtrosRoles = { nombre: '' };

  // Modal State
  isModalOpen = false;
  rolSeleccionado: any | null = null;
  permisosActuales: Permiso[] = [];

  // Las pantallas dinámicas disponibles en el sistema
  pantallasSistema: string[] = [
    'PUESTOS', 'COLABORADORES', 'HARDWARE', 'HARDWARE_IDEAL',
    'SOFTWARE', 'SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'
  ];

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.cargarDatosBase();
  }

  cargarDatosBase() {
    this.permissionService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res;
        this.rolesFiltrados = [...this.roles];
      },
      error: (err) => console.error('Error loading roles', err)
    });
  }

  aplicarFiltrosRoles() {
    if (!this.filtrosRoles.nombre) {
      this.rolesFiltrados = [...this.roles];
    } else {
      const search = this.filtrosRoles.nombre.toLowerCase();
      this.rolesFiltrados = this.roles.filter(r =>
        r.nombre.toLowerCase().includes(search)
      );
    }
  }

  limpiarFiltrosRoles() {
    this.filtrosRoles.nombre = '';
    this.aplicarFiltrosRoles();
  }

  abrirModalPermisos(rol: any) {
    this.rolSeleccionado = rol;
    this.permissionService.getPermisosPorRol(rol.id).subscribe({
      next: (res) => {
        // Asegurarnos de que todas las pantallas existan en la matriz del rol
        this.permisosActuales = this.pantallasSistema.map(pantalla => {
          const permisoExistente = res.find((p: Permiso) => p.pantallaId === pantalla);
          return permisoExistente || {
            roleId: rol.id,
            pantallaId: pantalla,
            puedeCrear: false,
            puedeEditar: false,
            puedeEliminar: false,
            puedeVer: false
          };
        });
        this.isModalOpen = true;
      },
      error: (err) => console.error('Error loading permissions', err)
    });
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.rolSeleccionado = null;
    this.permisosActuales = [];
  }

  guardarPermisos() {
    if (!this.rolSeleccionado) return;

    this.permissionService.guardarPermisos(this.rolSeleccionado.id, this.permisosActuales).subscribe({
      next: () => {
        alert('Permisos guardados correctamente');
        this.cerrarModal();
      },
      error: (err) => alert('Error al guardar permisos')
    });
  }
}
