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
<main *appPermiso="{pantalla: 'SEGURIDAD', accion: 'ver'}" class="p-gutter max-w-container-max-width mx-auto space-y-8">
  <!-- Heading -->
  <div class="mb-8 mt-4 flex flex-col gap-1">
    <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Seguridad (RBAC)</h2>
    <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
      Administre los roles, usuarios y la matriz de permisos de acceso al sistema.
    </p>
  </div>

  <div class="grid grid-cols-12 gap-gutter items-start">
    <div class="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
      <div class="ucc-card p-0">
        <!-- Integrated Tabs -->
        <div class="flex border-b border-ucc-neutral-outline/30 p-1 bg-ucc-neutral-outline/10">
          <button (click)="setTab('usuarios')" [ngClass]="activeTab === 'usuarios' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">group</span> Usuarios
          </button>
          <button (click)="setTab('roles')" [ngClass]="activeTab === 'roles' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span> Roles
          </button>
          <button (click)="setTab('permisos')" [ngClass]="activeTab === 'permisos' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">security</span> Matriz de Permisos
          </button>
        </div>

        <div class="p-0">

          <!-- TAB: USUARIOS -->
          <div *ngIf="activeTab === 'usuarios'" class="ucc-table-container">
            <div class="px-6 py-4 bg-ucc-secondary flex justify-between items-center">
              <h3 class="text-white font-bold flex items-center gap-2 text-body-lg">
                <span class="material-symbols-outlined">group</span> Usuarios Registrados
              </h3>
            </div>

            <div class="overflow-x-auto">
              <table class="ucc-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Rol Actual</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for(user of usuarios; track user.id) {
                    <tr>
                      <td class="font-bold text-ucc-neutral-variant">{{user.id}}</td>
                      <td class="font-semibold">{{user.nombreUsuario}}</td>
                      <td>
                        <select class="ucc-input text-sm p-1 h-8 w-auto min-w-[150px]" [(ngModel)]="user.rolId" (change)="cambiarRolUsuario(user)">
                          <option *ngFor="let r of roles" [value]="r.id">{{r.nombre}}</option>
                        </select>
                      </td>
                      <td class="text-right">
                        <div class="flex justify-end gap-2">
                          <button class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="text-center p-6 text-ucc-neutral-variant bg-ucc-surface">No hay usuarios.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB: ROLES -->
          <div *ngIf="activeTab === 'roles'" class="ucc-table-container">
            <div class="px-6 py-4 bg-ucc-secondary flex justify-between items-center">
              <h3 class="text-white font-bold flex items-center gap-2 text-body-lg">
                <span class="material-symbols-outlined">admin_panel_settings</span> Roles Disponibles
              </h3>
            </div>

            <div class="overflow-x-auto">
              <table class="ucc-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  @for(rol of roles; track rol.id) {
                    <tr>
                      <td class="font-bold text-ucc-neutral-variant">{{rol.id}}</td>
                      <td class="font-semibold">{{rol.nombre}}</td>
                      <td class="text-ucc-neutral-variant">{{rol.descripcion}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="3" class="text-center p-6 text-ucc-neutral-variant bg-ucc-surface">No hay roles.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB: MATRIZ DE PERMISOS -->
          <div *ngIf="activeTab === 'permisos'">

            <div class="p-6 bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20 flex items-center gap-4">
              <label class="font-bold text-ucc-secondary">Seleccionar Rol:</label>
              <select [(ngModel)]="rolSeleccionadoId" (change)="cargarPermisos()" class="ucc-input max-w-xs">
                <option [ngValue]="null" disabled>-- Seleccione un Rol --</option>
                <option *ngFor="let rol of roles" [ngValue]="rol.id">{{ rol.nombre }}</option>
              </select>
            </div>

            <div *ngIf="rolSeleccionadoId" class="overflow-x-auto p-6">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b-2 border-ucc-primary-container text-ucc-secondary">
                    <th class="py-3 px-4 font-bold uppercase tracking-wider text-sm w-2/6">Pantalla</th>
                    <th class="py-3 px-4 font-bold uppercase tracking-wider text-sm text-center">Puede Ver</th>
                    <th class="py-3 px-4 font-bold uppercase tracking-wider text-sm text-center">Puede Crear</th>
                    <th class="py-3 px-4 font-bold uppercase tracking-wider text-sm text-center">Puede Editar</th>
                    <th class="py-3 px-4 font-bold uppercase tracking-wider text-sm text-center">Puede Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  @for(permiso of permisosActuales; track permiso.pantallaId) {
                    <tr class="border-b border-ucc-neutral-outline/20 hover:bg-ucc-neutral-outline/5 transition-colors">
                      <td class="py-4 px-4 font-semibold text-ucc-neutral-text">{{permiso.pantallaId}}</td>
                      <td class="py-4 px-4 text-center">
                        <label class="inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="permiso.puedeVer" (change)="actualizarPermisoIndividual(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded focus:ring-ucc-primary">
                        </label>
                      </td>
                      <td class="py-4 px-4 text-center">
                        <label class="inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="permiso.puedeCrear" (change)="actualizarPermisoIndividual(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded focus:ring-ucc-primary">
                        </label>
                      </td>
                      <td class="py-4 px-4 text-center">
                        <label class="inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="permiso.puedeEditar" (change)="actualizarPermisoIndividual(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded focus:ring-ucc-primary">
                        </label>
                      </td>
                      <td class="py-4 px-4 text-center">
                        <label class="inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="permiso.puedeEliminar" (change)="actualizarPermisoIndividual(permiso)" class="form-checkbox h-5 w-5 text-ucc-primary rounded focus:ring-ucc-primary">
                        </label>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div *ngIf="!rolSeleccionadoId" class="p-12 text-center text-ucc-neutral-variant">
              <span class="material-symbols-outlined text-[48px] opacity-50 mb-2">admin_panel_settings</span>
              <p>Seleccione un rol de la lista para gestionar sus permisos de acceso.</p>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- Right Panel: Info -->
    <div class="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
        <div class="ucc-card bg-ucc-primary text-white border-none relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h4 class="font-title-lg text-title-lg mb-4 flex items-center gap-2 relative z-10">
                <span class="material-symbols-outlined">shield_locked</span>
                Directiva de Seguridad
            </h4>
            <p class="text-body-md text-white/80 relative z-10">
                Los cambios en la matriz de permisos se aplican inmediatamente. Los usuarios con el rol modificado necesitarán reiniciar su sesión para que los nuevos accesos tomen efecto en su token.
            </p>
        </div>
    </div>
  </div>
</main>
  `
})
export class SeguridadComponent implements OnInit {
  activeTab: 'usuarios' | 'roles' | 'permisos' = 'usuarios';

  // Data
  roles: any[] = [];
  usuarios: any[] = [];

  // Permisos State
  rolSeleccionadoId: number | null = null;
  permisosActuales: Permiso[] = [];

  // Las pantallas dinámicas disponibles en el sistema
  pantallasSistema: string[] = [
    'PUESTOS', 'COLABORADORES', 'HARDWARE', 'EQUIPO_IDEAL', 'SOFTWARE_LOCAL',
    'PERMISOS_SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD', 'CATALOGOS', 'DASHBOARD'
  ];

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.cargarDatosBase();
  }

  setTab(tab: 'usuarios' | 'roles' | 'permisos') {
    this.activeTab = tab;
  }

  cargarDatosBase() {
    this.permissionService.getAllRoles().subscribe({
      next: (res) => this.roles = res,
      error: (err) => console.error('Error loading roles', err)
    });

    this.permissionService.getUsuarios().subscribe({
      next: (res) => this.usuarios = res,
      error: (err) => console.error('Error loading usuarios', err)
    });
  }

  cargarPermisos() {
    if (!this.rolSeleccionadoId) return;

    this.permissionService.getPermisosPorRol(this.rolSeleccionadoId).subscribe({
      next: (res) => {
        // Asegurarnos de que todas las pantallas existan en la matriz del rol
        this.permisosActuales = this.pantallasSistema.map(pantalla => {
          const permisoExistente = res.find((p: Permiso) => p.pantallaId === pantalla);
          return permisoExistente || {
            id: 0,
            roleId: this.rolSeleccionadoId!,
            pantallaId: pantalla,
            puedeCrear: false,
            puedeEditar: false,
            puedeEliminar: false,
            puedeVer: false
          };
        });
      },
      error: (err) => console.error('Error loading permissions', err)
    });
  }

  actualizarPermisoIndividual(permiso: Permiso) {
    if (!this.rolSeleccionadoId) return;

    // Al hacer check/uncheck se manda a guardar directamente ese permiso
    this.permissionService.gestionarPermiso(permiso).subscribe({
      next: () => {
         console.log(`Permiso guardado para pantalla: ${permiso.pantallaId}`);
         // Si era nuevo (id = 0), deberiamos idealmente refrescar para obtener el ID real insertado,
         // o hacer que la API lo retorne. Por simplicidad del requerimiento, refrescamos la grilla
         // silenciosamente.
         if(permiso.id === 0 || !permiso.id) {
             this.cargarPermisos();
         }
      },
      error: (err) => {
        alert('Error al guardar permiso en BD. Revierta el cambio.');
        this.cargarPermisos(); // Reload to restore previous state on error
      }
    });
  }

  cambiarRolUsuario(usuario: any) {
    this.permissionService.actualizarRolUsuario(usuario.id, usuario.rolId).subscribe({
      next: () => {
        console.log(`Rol actualizado para el usuario ${usuario.nombreUsuario}`);
      },
      error: (err) => {
        alert('Error al actualizar el rol del usuario.');
      }
    });
  }

}
