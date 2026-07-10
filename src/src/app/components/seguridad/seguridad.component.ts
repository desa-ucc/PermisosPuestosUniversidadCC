import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PermissionService, Permiso } from '../../services/permission.service';
import { PermisoDirective } from '../../directives/permiso.directive';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermisoDirective],
  template: `
<main class="p-gutter max-w-container-max-width mx-auto space-y-8">
  <div class="mb-8">
    <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Seguridad (RBAC)</h2>
    <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
      Administre los roles, usuarios y la matriz de permisos de acceso al sistema.
    </p>
  </div>

  <div class="grid grid-cols-12 gap-gutter">
    <div class="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
      <!-- Tabs -->
      <div class="flex border-b border-ucc-neutral-outline/30 mb-2">
        <button (click)="setTab('roles')" [class.border-ucc-primary]="activeTab === 'roles'" [class.text-ucc-primary]="activeTab === 'roles'" class="px-6 py-3 font-title-sm font-bold text-ucc-neutral-variant hover:text-ucc-primary border-b-2 border-transparent transition-all">Roles</button>
        <button (click)="setTab('usuarios')" [class.border-ucc-primary]="activeTab === 'usuarios'" [class.text-ucc-primary]="activeTab === 'usuarios'" class="px-6 py-3 font-title-sm font-bold text-ucc-neutral-variant hover:text-ucc-primary border-b-2 border-transparent transition-all">Usuarios</button>
        <button (click)="setTab('permisos')" [class.border-ucc-primary]="activeTab === 'permisos'" [class.text-ucc-primary]="activeTab === 'permisos'" class="px-6 py-3 font-title-sm font-bold text-ucc-neutral-variant hover:text-ucc-primary border-b-2 border-transparent transition-all">Matriz de Permisos</button>
      </div>

      <!-- Tab Content: Roles -->
      <div *ngIf="activeTab === 'roles'" class="bg-ucc-surface-container-low rounded-xl shadow-sm border border-ucc-neutral-outline/20 overflow-hidden">
        <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
          <span class="material-symbols-outlined text-ucc-neutral-variant" data-icon="filter_list">filter_list</span>
          <input type="text" placeholder="Filtrar..." [(ngModel)]="filtrosRoles" (input)="aplicarFiltrosRoles()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
          <button (click)="limpiarFiltrosRoles()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
            <span class="material-symbols-outlined text-[18px]">refresh</span> Limpiar Filtros
          </button>
        </div>

        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-ucc-surface-container-lowest border-b border-ucc-neutral-outline/20">
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">ID</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">Nombre del Rol</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">Descripción</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for(rol of rolesFiltrados; track rol.id) {
                <tr class="border-b border-ucc-neutral-outline/10 hover:bg-ucc-surface-container-lowest/50 transition-colors">
                  <td class="py-3 px-4 text-sm font-bold text-ucc-secondary">{{rol.id}}</td>
                  <td class="py-3 px-4 text-sm text-ucc-neutral-text">{{rol.nombre}}</td>
                  <td class="py-3 px-4 text-sm text-ucc-neutral-text">{{rol.descripcion}}</td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'EDITAR'}" (click)="editarRol(rol)" class="p-2 text-ucc-primary hover:bg-ucc-primary/10 rounded-lg transition-colors" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                      <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'ELIMINAR'}" (click)="eliminarRol(rol.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="p-6 text-center text-ucc-neutral-variant bg-ucc-surface">No hay roles registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: Usuarios -->
      <div *ngIf="activeTab === 'usuarios'" class="bg-ucc-surface-container-low rounded-xl shadow-sm border border-ucc-neutral-outline/20 overflow-hidden">
        <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
          <span class="material-symbols-outlined text-ucc-neutral-variant" data-icon="filter_list">filter_list</span>
          <input type="text" placeholder="Filtrar..." [(ngModel)]="filtrosUsuarios" (input)="aplicarFiltrosUsuarios()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
          <button (click)="limpiarFiltrosUsuarios()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
            <span class="material-symbols-outlined text-[18px]">refresh</span> Limpiar Filtros
          </button>
        </div>

        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-ucc-surface-container-lowest border-b border-ucc-neutral-outline/20">
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">ID</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">Usuario</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">Email</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider">Rol</th>
                <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for(usuario of usuariosFiltrados; track usuario.id) {
                <tr class="border-b border-ucc-neutral-outline/10 hover:bg-ucc-surface-container-lowest/50 transition-colors">
                  <td class="py-3 px-4 text-sm font-bold text-ucc-secondary">{{usuario.id}}</td>
                  <td class="py-3 px-4 text-sm text-ucc-neutral-text">{{usuario.nombreUsuario}}</td>
                  <td class="py-3 px-4 text-sm text-ucc-neutral-text">{{usuario.email}}</td>
                  <td class="py-3 px-4 text-sm"><span class="inline-flex items-center px-3 py-1 rounded-full bg-ucc-primary-container/10 text-ucc-primary-container text-[11px] font-bold">{{usuario.nombreRol}}</span></td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'EDITAR'}" (click)="editarUsuario(usuario)" class="p-2 text-ucc-primary hover:bg-ucc-primary/10 rounded-lg transition-colors" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                      <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'ELIMINAR'}" (click)="eliminarUsuario(usuario.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="p-6 text-center text-ucc-neutral-variant bg-ucc-surface">No hay usuarios registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: Matriz de Permisos -->
      <div *ngIf="activeTab === 'permisos'" class="bg-ucc-surface-container-low rounded-xl shadow-sm border border-ucc-neutral-outline/20 overflow-hidden">
        <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-4 items-center">
            <span class="material-symbols-outlined text-ucc-primary-container">admin_panel_settings</span>
            <span class="text-sm font-bold text-ucc-secondary">Seleccionar Rol:</span>

            <div class="relative w-64" (click)="toggleDropdownMatriz()">
                <div class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm flex justify-between items-center cursor-pointer focus-within:border-ucc-primary focus-within:ring-1 focus-within:ring-ucc-primary transition-all">
                    <span>{{ rolMatrizSeleccionado?.nombre || 'Seleccione un rol...' }}</span>
                    <span class="material-symbols-outlined text-ucc-neutral-variant text-[20px] transition-transform duration-200" [class.rotate-180]="showMatrizDropdown">expand_more</span>
                </div>
                <div *ngIf="showMatrizDropdown" class="absolute z-50 w-full mt-1 bg-white border border-ucc-neutral-outline/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul class="py-1">
                        <li *ngFor="let rol of roles" (mousedown)="seleccionarRolParaMatriz(rol)" class="px-4 py-2 text-sm hover:bg-ucc-primary/10 cursor-pointer text-ucc-neutral-text transition-colors">
                            {{ rol.nombre }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="overflow-x-auto min-h-[400px]">
          @if(rolMatrizSeleccionado) {
            <table class="w-full text-left border-collapse">
                <thead>
                <tr class="bg-ucc-surface-container-lowest border-b border-ucc-neutral-outline/20">
                    <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider w-2/6">Pantalla</th>
                    <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-center w-1/6">Crear</th>
                    <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-center w-1/6">Editar</th>
                    <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-center w-1/6">Eliminar</th>
                    <th class="py-3 px-4 text-[11px] font-bold text-ucc-neutral-variant uppercase tracking-wider text-center w-1/6">Ver</th>
                </tr>
                </thead>
                <tbody>
                @for(permiso of permisosActuales; track permiso.pantallaId) {
                    <tr class="border-b border-ucc-neutral-outline/10 hover:bg-ucc-surface-container-lowest/50 transition-colors">
                        <td class="py-3 px-4 text-sm font-bold text-ucc-secondary">{{permiso.pantallaId}}</td>
                        <td class="py-3 px-4 text-center">
                            <input type="checkbox" [(ngModel)]="permiso.puedeCrear" (change)="guardarPermiso(permiso)" class="w-4 h-4 text-ucc-primary rounded border-ucc-neutral-outline/50 focus:ring-ucc-primary focus:ring-offset-0 bg-white cursor-pointer accent-ucc-primary">
                        </td>
                        <td class="py-3 px-4 text-center">
                            <input type="checkbox" [(ngModel)]="permiso.puedeEditar" (change)="guardarPermiso(permiso)" class="w-4 h-4 text-ucc-primary rounded border-ucc-neutral-outline/50 focus:ring-ucc-primary focus:ring-offset-0 bg-white cursor-pointer accent-ucc-primary">
                        </td>
                        <td class="py-3 px-4 text-center">
                            <input type="checkbox" [(ngModel)]="permiso.puedeEliminar" (change)="guardarPermiso(permiso)" class="w-4 h-4 text-ucc-primary rounded border-ucc-neutral-outline/50 focus:ring-ucc-primary focus:ring-offset-0 bg-white cursor-pointer accent-ucc-primary">
                        </td>
                        <td class="py-3 px-4 text-center">
                            <input type="checkbox" [(ngModel)]="permiso.puedeVer" (change)="guardarPermiso(permiso)" class="w-4 h-4 text-ucc-primary rounded border-ucc-neutral-outline/50 focus:ring-ucc-primary focus:ring-offset-0 bg-white cursor-pointer accent-ucc-primary">
                        </td>
                    </tr>
                }
                </tbody>
            </table>
          } @else {
            <div class="flex flex-col items-center justify-center p-12 text-ucc-neutral-variant">
                <span class="material-symbols-outlined text-[48px] mb-4 text-ucc-neutral-outline">table_chart</span>
                <p>Seleccione un rol para ver y editar su matriz de permisos.</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Right: Form/Summary Panel -->
    <div class="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
      <!-- Roles Form -->
      <div *ngIf="activeTab === 'roles'" class="ucc-card">
        <h4 class="font-title-lg text-title-lg text-ucc-secondary mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-ucc-primary-container">edit_document</span>
            {{ formRol.get('id')?.value ? 'Editar Rol' : 'Nuevo Rol' }}
        </h4>
        <form [formGroup]="formRol" (ngSubmit)="onSubmitRol()" class="space-y-4">
            <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-ucc-secondary">Nombre <span class="text-ucc-error">*</span></label>
                <input type="text" formControlName="nombre" class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none" placeholder="Ej: Administrador">
                <span *ngIf="formRol.get('nombre')?.invalid && formRol.get('nombre')?.touched" class="text-[10px] text-ucc-error">Requerido</span>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-ucc-secondary">Descripción</label>
                <textarea formControlName="descripcion" rows="3" class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none" placeholder="Descripción del rol..."></textarea>
            </div>
            <div class="flex gap-3 pt-2">
                <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'CREAR'}" type="submit" [disabled]="isSaving" class="flex-1 bg-ucc-primary hover:bg-ucc-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-all flex justify-center items-center gap-2 text-sm shadow-md shadow-ucc-primary/20 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'sync' : 'save' }}</span>
                    {{ isSaving ? 'Guardando...' : 'Guardar' }}
                </button>
                <button type="button" *ngIf="formRol.get('id')?.value" (click)="resetFormRol()" class="flex-1 bg-ucc-surface-container-highest hover:bg-ucc-neutral-outline/20 text-ucc-secondary font-bold py-2 px-4 rounded-lg transition-all text-sm border border-ucc-neutral-outline/30">
                    Cancelar
                </button>
            </div>
        </form>
      </div>

      <!-- Usuarios Form -->
      <div *ngIf="activeTab === 'usuarios'" class="ucc-card overflow-visible">
        <h4 class="font-title-lg text-title-lg text-ucc-secondary mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-ucc-primary-container">person_add</span>
            {{ formUsuario.get('id')?.value ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h4>
        <form [formGroup]="formUsuario" (ngSubmit)="onSubmitUsuario()" class="space-y-4">
            <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-ucc-secondary">Nombre de Usuario <span class="text-ucc-error">*</span></label>
                <input type="text" formControlName="nombreUsuario" class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none">
            </div>
            <div class="flex flex-col gap-1" *ngIf="!formUsuario.get('id')?.value">
                <label class="text-sm font-semibold text-ucc-secondary">Contraseña <span class="text-ucc-error">*</span></label>
                <input type="password" formControlName="passwordHash" class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none">
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-ucc-secondary">Email</label>
                <input type="email" formControlName="email" class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg px-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none">
            </div>

            <!-- Searchable Dropdown for RolId -->
            <div class="flex flex-col gap-1 relative">
                <label class="text-sm font-semibold text-ucc-secondary">Rol Asignado <span class="text-ucc-error">*</span></label>
                <div class="relative w-full">
                    <input type="text"
                        [value]="rolSearchTerm"
                        (input)="onRolSearch($event)"
                        (focus)="showRolDropdown = true"
                        (blur)="hideRolDropdown()"
                        placeholder="Buscar rol..."
                        class="w-full bg-ucc-surface-container-lowest border border-ucc-neutral-outline/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-ucc-primary focus:ring-1 focus:ring-ucc-primary transition-all outline-none">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ucc-neutral-variant text-[20px]">search</span>

                    <div *ngIf="showRolDropdown && rolesDropdownFiltrados.length > 0"
                         class="absolute z-50 w-full mt-1 bg-white border border-ucc-neutral-outline/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <ul class="py-1">
                            <li *ngFor="let r of rolesDropdownFiltrados"
                                (mousedown)="seleccionarRolFormulario(r)"
                                class="px-4 py-2 text-sm hover:bg-ucc-primary/10 cursor-pointer text-ucc-neutral-text transition-colors">
                                {{ r.nombre }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button *appPermiso="{pantalla: 'SEGURIDAD', accion: 'CREAR'}" type="submit" [disabled]="isSaving" class="flex-1 bg-ucc-primary hover:bg-ucc-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-all flex justify-center items-center gap-2 text-sm shadow-md shadow-ucc-primary/20 disabled:opacity-50">
                    <span class="material-symbols-outlined text-[18px]">{{ isSaving ? 'sync' : 'save' }}</span>
                    {{ isSaving ? 'Guardando...' : 'Guardar' }}
                </button>
                <button type="button" *ngIf="formUsuario.get('id')?.value" (click)="resetFormUsuario()" class="flex-1 bg-ucc-surface-container-highest hover:bg-ucc-neutral-outline/20 text-ucc-secondary font-bold py-2 px-4 rounded-lg transition-all text-sm border border-ucc-neutral-outline/30">
                    Cancelar
                </button>
            </div>
        </form>
      </div>

      <!-- Summary for Permisos -->
      <div *ngIf="activeTab === 'permisos'" class="ucc-card">
        <h4 class="font-title-lg text-title-lg text-ucc-secondary mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-ucc-primary-container">info</span>
            Información
        </h4>
        <p class="text-sm text-ucc-neutral-variant mb-4">
            Seleccione un rol de la lista para ver y editar su matriz de permisos. Los cambios se guardan automáticamente al marcar o desmarcar cada casilla.
        </p>
        <div class="flex items-center gap-2 text-sm text-ucc-primary bg-ucc-primary/10 p-3 rounded-lg border border-ucc-primary/20">
            <span class="material-symbols-outlined">sync</span>
            <span>Autoguardado activado</span>
        </div>
      </div>

    </div>
  </div>
</main>
`
})
export class SeguridadComponent implements OnInit {
  activeTab: 'roles' | 'usuarios' | 'permisos' = 'roles';
  isSaving = false;

  // Data
  roles: any[] = [];
  rolesFiltrados: any[] = [];
  filtrosRoles = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtrosUsuarios = '';

  // Forms
  formRol: FormGroup;
  formUsuario: FormGroup;

  // Dropdown states
  showMatrizDropdown = false;
  rolMatrizSeleccionado: any | null = null;
  permisosActuales: Permiso[] = [];

  showRolDropdown = false;
  rolSearchTerm = '';
  rolesDropdownFiltrados: any[] = [];

  pantallasSistema: string[] = [
    'CATALOGOS', 'DASHBOARD', 'PUESTOS', 'COLABORADORES', 'EQUIPO_IDEAL', 'HARDWARE', 'SOFTWARE_LOCAL', 'PERMISOS_SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'
  ];

  constructor(private permissionService: PermissionService, private fb: FormBuilder) {
    this.formRol = this.fb.group({
        id: [null],
        nombre: ['', Validators.required],
        descripcion: ['']
    });

    this.formUsuario = this.fb.group({
        id: [null],
        nombreUsuario: ['', Validators.required],
        passwordHash: [''], // Only required on create, handled in logic
        email: [''],
        rolId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  setTab(tab: 'roles' | 'usuarios' | 'permisos') {
    this.activeTab = tab;
    if (tab === 'roles') this.loadRoles();
    if (tab === 'usuarios') this.loadUsuarios();
    if (tab === 'permisos') this.loadRoles(); // Need roles for the dropdown
  }

  // --- ROLES LOGIC ---
  loadRoles() {
    this.permissionService.getAllRoles().subscribe(res => {
      this.roles = res;
      this.aplicarFiltrosRoles();
    });
  }

  aplicarFiltrosRoles() {
    if (!this.filtrosRoles) {
      this.rolesFiltrados = [...this.roles];
    } else {
      const search = this.filtrosRoles.toLowerCase();
      this.rolesFiltrados = this.roles.filter(r => r.nombre.toLowerCase().includes(search));
    }
  }

  limpiarFiltrosRoles() {
    this.filtrosRoles = '';
    this.aplicarFiltrosRoles();
  }

  editarRol(rol: any) {
    if (!this.permissionService.tienePermiso('SEGURIDAD', 'EDITAR')) return;
    this.formRol.patchValue(rol);
  }

  resetFormRol() {
    this.formRol.reset();
  }

  onSubmitRol() {
    this.formRol.markAllAsTouched();
    if (this.formRol.invalid) return;

    this.isSaving = true;
    const data = this.formRol.value;
    const req$ = data.id ? this.permissionService.updateRol(data.id, data) : this.permissionService.createRol(data);

    req$.subscribe({
        next: () => {
            this.isSaving = false;
            this.resetFormRol();
            this.loadRoles();
        },
        error: () => {
            this.isSaving = false;
            alert('Error al guardar el rol');
        }
    });
  }

  eliminarRol(id: number) {
    if(confirm('¿Seguro de eliminar este rol?')) {
        this.permissionService.deleteRol(id).subscribe({
            next: () => this.loadRoles(),
            error: (err) => alert(err.error?.message || 'Error al eliminar')
        });
    }
  }

  // --- USUARIOS LOGIC ---
  loadUsuarios() {
    this.permissionService.getUsuarios().subscribe(res => {
        this.usuarios = res;
        this.aplicarFiltrosUsuarios();
    });
    // Ensure roles are loaded for dropdown
    if(this.roles.length === 0) this.permissionService.getAllRoles().subscribe(r => this.roles = r);
  }

  aplicarFiltrosUsuarios() {
    if (!this.filtrosUsuarios) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const search = this.filtrosUsuarios.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u => u.nombreUsuario.toLowerCase().includes(search) || (u.email && u.email.toLowerCase().includes(search)));
    }
  }

  limpiarFiltrosUsuarios() {
    this.filtrosUsuarios = '';
    this.aplicarFiltrosUsuarios();
  }

  editarUsuario(usuario: any) {
    if (!this.permissionService.tienePermiso('SEGURIDAD', 'EDITAR')) return;
    this.formUsuario.patchValue({
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        rolId: usuario.rolId,
        passwordHash: '' // Don't patch hash
    });

    // Explicitly set searchable dropdown state
    const rolStr = this.roles.find(r => r.id === usuario.rolId);
    this.rolSearchTerm = rolStr ? rolStr.nombre : '';
  }

  resetFormUsuario() {
    this.formUsuario.reset();
    this.rolSearchTerm = '';
  }

  onRolSearch(event: any) {
    this.rolSearchTerm = event.target.value;
    const search = this.rolSearchTerm.toLowerCase();
    this.rolesDropdownFiltrados = this.roles.filter(r => r.nombre.toLowerCase().includes(search));
    this.formUsuario.patchValue({ rolId: null });
  }

  hideRolDropdown() {
    setTimeout(() => this.showRolDropdown = false, 200);
  }

  seleccionarRolFormulario(rol: any) {
    this.formUsuario.patchValue({ rolId: rol.id });
    this.rolSearchTerm = rol.nombre;
    this.showRolDropdown = false;
  }

  onSubmitUsuario() {
    this.formUsuario.markAllAsTouched();
    if (!this.formUsuario.get('id')?.value && !this.formUsuario.get('passwordHash')?.value) {
        this.formUsuario.get('passwordHash')?.setErrors({required: true});
    }

    if (this.formUsuario.invalid) return;

    this.isSaving = true;
    const data = this.formUsuario.value;
    const req$ = data.id ? this.permissionService.updateUsuario(data.id, data) : this.permissionService.createUsuario(data);

    req$.subscribe({
        next: () => {
            this.isSaving = false;
            this.resetFormUsuario();
            this.loadUsuarios();
        },
        error: () => {
            this.isSaving = false;
            alert('Error al guardar el usuario');
        }
    });
  }

  eliminarUsuario(id: number) {
    if(confirm('¿Seguro de eliminar este usuario?')) {
        this.permissionService.deleteUsuario(id).subscribe({
            next: () => this.loadUsuarios(),
            error: () => alert('Error al eliminar')
        });
    }
  }

  // --- PERMISOS MATRIZ LOGIC ---
  toggleDropdownMatriz() {
      this.showMatrizDropdown = !this.showMatrizDropdown;
  }

  seleccionarRolParaMatriz(rol: any) {
      this.rolMatrizSeleccionado = rol;
      this.showMatrizDropdown = false;

      this.permissionService.getPermisosPorRol(rol.id).subscribe(res => {
        // Map all required screens, overriding with existing permissions if found
        this.permisosActuales = this.pantallasSistema.map(pantalla => {
          const existente = res.find((p: Permiso) => p.pantallaId === pantalla);
          return existente || {
            roleId: rol.id,
            pantallaId: pantalla,
            puedeCrear: false,
            puedeEditar: false,
            puedeEliminar: false,
            puedeVer: false
          };
        });
      });
  }

  guardarPermiso(permiso: Permiso) {
    // Only execute if user has edit permission for security screen
    if (!this.permissionService.tienePermiso('SEGURIDAD', 'EDITAR')) {
        alert("No tiene permisos para modificar esto");
        return;
    }

    this.permissionService.updateSinglePermiso(permiso.id || 0, permiso).subscribe({
        next: () => console.log('Permiso guardado', permiso),
        error: () => alert('Error al guardar el permiso')
    });
  }
}
