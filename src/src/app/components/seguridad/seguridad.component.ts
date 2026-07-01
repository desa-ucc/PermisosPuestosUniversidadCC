import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionService, Permiso } from '../../services/permission.service';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<main class="p-gutter max-w-container-max-width mx-auto space-y-8">
  <!-- Heading -->
  <div class="mb-8">
    <h2 class="font-headline-lg text-headline-lg text-secondary">Gestión de Seguridad (RBAC)</h2>
    <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
      Administre los roles, usuarios y la matriz de permisos de acceso al sistema.
    </p>
  </div>

  <div class="bg-surface-container-low rounded-xl card-shadow border border-outline-variant/20 overflow-hidden">
    <!-- Tabs -->
    <div class="flex border-b border-outline-variant/20 bg-surface">
      <button
        (click)="activeTab = 'roles'"
        [class.border-b-2]="activeTab === 'roles'"
        [class.border-primary]="activeTab === 'roles'"
        [class.text-primary]="activeTab === 'roles'"
        [class.text-on-surface-variant]="activeTab !== 'roles'"
        class="px-6 py-4 font-label-lg font-bold transition-all hover:bg-surface-container-highest">
        Matriz de Permisos
      </button>
      <button
        (click)="activeTab = 'usuarios'"
        [class.border-b-2]="activeTab === 'usuarios'"
        [class.border-primary]="activeTab === 'usuarios'"
        [class.text-primary]="activeTab === 'usuarios'"
        [class.text-on-surface-variant]="activeTab !== 'usuarios'"
        class="px-6 py-4 font-label-lg font-bold transition-all hover:bg-surface-container-highest">
        Usuarios del Sistema
      </button>
    </div>

    <!-- Pestaña: Matriz de Permisos -->
    <div *ngIf="activeTab === 'roles'" class="p-0">

      <!-- Select Rol -->
      <div class="p-6 bg-surface border-b border-outline-variant/20 flex items-center gap-4">
        <label class="font-label-md font-bold text-secondary">Seleccione un Rol para configurar:</label>
        <select class="ucc-input w-64" [(ngModel)]="selectedRoleId" (change)="onRoleChange()">
          <option [ngValue]="null">-- Seleccione un Rol --</option>
          <option *ngFor="let rol of roles" [value]="rol.id">{{rol.nombre}}</option>
        </select>

        <button *ngIf="selectedRoleId" (click)="guardarPermisos()" class="ucc-btn-primary ml-auto flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Guardar Cambios
        </button>
      </div>

      <!-- Data Table Permisos -->
      <section class="ucc-table-container mt-0 rounded-none border-0 shadow-none">

        <!-- Toolbar de Filtros Estándar -->
        <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
          <span class="material-symbols-outlined text-ucc-neutral-variant" data-icon="filter_list">filter_list</span>
          <input type="text" placeholder="Filtrar por Pantalla..." [(ngModel)]="filtrosPermisos.pantalla" (input)="aplicarFiltrosPermisos()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-64">
          <button (click)="limpiarFiltrosPermisos()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
            <span class="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span> Limpiar Filtros
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="ucc-table">
            <thead>
              <tr>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-left w-1/3">Pantalla / Módulo</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Ver</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Crear</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Editar</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              @if(!selectedRoleId) {
                <tr>
                  <td colspan="5" class="py-8 px-6 text-center font-body-md text-on-surface-variant">
                    Seleccione un rol para visualizar y editar su matriz de permisos.
                  </td>
                </tr>
              } @else {
                @for(permiso of permisosFiltrados; track permiso.pantallaId) {
                  <tr class="hover:bg-surface-container-lowest transition-colors">
                    <td class="py-4 px-6 font-body-md text-body-md font-bold text-secondary">{{permiso.pantallaId}}</td>

                    <td class="py-4 px-6 text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="permiso.puedeVer" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                      </label>
                    </td>

                    <td class="py-4 px-6 text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="permiso.puedeCrear" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                      </label>
                    </td>

                    <td class="py-4 px-6 text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="permiso.puedeEditar" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                      </label>
                    </td>

                    <td class="py-4 px-6 text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="permiso.puedeEliminar" class="form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-surface">
                      </label>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Pestaña: Usuarios -->
    <div *ngIf="activeTab === 'usuarios'" class="p-0">

      <!-- Toolbar de Filtros Estándar -->
      <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
        <span class="material-symbols-outlined text-ucc-neutral-variant" data-icon="filter_list">filter_list</span>
        <input type="text" placeholder="Filtrar por Usuario..." [(ngModel)]="filtrosUsuarios.usuario" (input)="aplicarFiltrosUsuarios()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
        <input type="text" placeholder="Filtrar por Email..." [(ngModel)]="filtrosUsuarios.email" (input)="aplicarFiltrosUsuarios()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
        <button (click)="limpiarFiltrosUsuarios()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
          <span class="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span> Limpiar Filtros
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="ucc-table">
          <thead>
            <tr>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-left">Usuario</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-left">Email</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-center">Rol Asignado</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase text-center">Estado</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(usuario of usuariosFiltrados; track usuario.id) {
              <tr class="hover:bg-surface-container-lowest transition-colors">
                <td class="py-4 px-6 font-body-md text-body-md font-bold text-secondary">{{usuario.nombreUsuario}}</td>
                <td class="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{{usuario.email}}</td>
                <td class="py-4 px-6 text-center">
                  <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">
                    {{getRolName(usuario.rolId)}}
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="usuario.activo ? 'bg-success/20 text-success' : 'bg-error/20 text-error'">
                    {{usuario.activo ? 'Activo' : 'Inactivo'}}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex justify-center gap-3">
                    <button class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined" data-icon="edit">edit</span>
                    </button>
                    <button class="p-2 text-error hover:bg-error/10 rounded-full transition-all" title="Eliminar">
                      <span class="material-symbols-outlined" data-icon="delete">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="py-8 px-6 text-center font-body-md text-on-surface-variant">No hay usuarios registrados o que coincidan con la búsqueda.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>
  `
})
export class SeguridadComponent implements OnInit {
  activeTab: 'roles' | 'usuarios' = 'roles';

  // Data
  roles: any[] = [];
  usuarios: any[] = [];

  // Tab Roles/Permisos
  selectedRoleId: number | null = null;
  permisosActuales: Permiso[] = [];
  permisosFiltrados: Permiso[] = [];

  // Las pantallas dinámicas disponibles en el sistema (idealmente cargadas desde config o enum)
  pantallasSistema: string[] = [
    'PUESTOS', 'COLABORADORES', 'HARDWARE', 'HARDWARE_IDEAL',
    'SOFTWARE', 'SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'
  ];

  filtrosPermisos = { pantalla: '' };

  // Tab Usuarios
  usuariosFiltrados: any[] = [];
  filtrosUsuarios = { usuario: '', email: '' };

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.cargarDatosBase();
  }

  cargarDatosBase() {
    this.permissionService.getAllRoles().subscribe({
      next: (res) => this.roles = res,
      error: (err) => console.error('Error loading roles', err)
    });

    this.permissionService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.usuariosFiltrados = [...this.usuarios];
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  onRoleChange() {
    if (!this.selectedRoleId) {
      this.permisosActuales = [];
      this.permisosFiltrados = [];
      return;
    }

    this.permissionService.getPermisosPorRol(this.selectedRoleId).subscribe({
      next: (res) => {
        // Asegurarnos de que todas las pantallas existan en la matriz del rol
        this.permisosActuales = this.pantallasSistema.map(pantalla => {
          const permisoExistente = res.find((p: Permiso) => p.pantallaId === pantalla);
          return permisoExistente || {
            roleId: this.selectedRoleId!,
            pantallaId: pantalla,
            puedeCrear: false,
            puedeEditar: false,
            puedeEliminar: false,
            puedeVer: false
          };
        });

        this.aplicarFiltrosPermisos();
      },
      error: (err) => console.error('Error loading permissions', err)
    });
  }

  // --- Filtros Tab Permisos ---
  aplicarFiltrosPermisos() {
    if (!this.filtrosPermisos.pantalla) {
      this.permisosFiltrados = [...this.permisosActuales];
    } else {
      const search = this.filtrosPermisos.pantalla.toLowerCase();
      this.permisosFiltrados = this.permisosActuales.filter(p =>
        p.pantallaId.toLowerCase().includes(search)
      );
    }
  }

  limpiarFiltrosPermisos() {
    this.filtrosPermisos.pantalla = '';
    this.aplicarFiltrosPermisos();
  }

  guardarPermisos() {
    if (!this.selectedRoleId) return;

    this.permissionService.guardarPermisos(this.selectedRoleId, this.permisosActuales).subscribe({
      next: () => alert('Permisos guardados correctamente'),
      error: (err) => alert('Error al guardar permisos')
    });
  }

  // --- Filtros Tab Usuarios ---
  aplicarFiltrosUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchUsuario = u.nombreUsuario.toLowerCase().includes(this.filtrosUsuarios.usuario.toLowerCase());
      const matchEmail = u.email.toLowerCase().includes(this.filtrosUsuarios.email.toLowerCase());
      return matchUsuario && matchEmail;
    });
  }

  limpiarFiltrosUsuarios() {
    this.filtrosUsuarios = { usuario: '', email: '' };
    this.usuariosFiltrados = [...this.usuarios];
  }

  getRolName(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'Desconocido';
  }
}
