import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '../../services/permission.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { SeguridadService } from '../../services/seguridad.service';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PermisoDirective],
  templateUrl: './seguridad.component.html'
})
export class SeguridadComponent implements OnInit {
  activeTab: 'roles' | 'usuarios' | 'permisos' = 'roles';

  // Data
  roles: any[] = [];
  rolesFiltrados: any[] = [];
  filtrosRoles = { nombre: '' };

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtrosUsuarios = { nombreUsuario: '' };

  // Forms
  rolForm: FormGroup;
  usuarioForm: FormGroup;

  // Modals
  isRolModalOpen = false;
  isUsuarioModalOpen = false;
  isEditMode = false;
  selectedId: number | null = null;

  // Permisos
  rolSeleccionadoId: number | null = null;
  permisosActuales: any[] = [];
  pantallasSistema: string[] = [
    'CATALOGOS', 'DASHBOARD', 'PUESTOS', 'COLABORADORES', 'EQUIPO_IDEAL',
    'HARDWARE', 'SOFTWARE_LOCAL', 'PERMISOS_SITIOS', 'PLATAFORMAS', 'REPORTES', 'SEGURIDAD'
  ];

  constructor(
    private permissionService: PermissionService,
    private seguridadService: SeguridadService,
    private fb: FormBuilder
  ) {
    this.rolForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });

    this.usuarioForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      passwordHash: [''],
      email: ['', [Validators.required, Validators.email]],
      rolId: [null, Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  setTab(tab: 'roles' | 'usuarios' | 'permisos') {
    this.activeTab = tab;
    if (tab === 'roles') this.cargarRoles();
    if (tab === 'usuarios') this.cargarUsuarios();
  }

  // --- ROLES ---
  cargarRoles() {
    this.permissionService.getAllRoles().subscribe(res => {
      this.roles = res;
      if (!this.roles || this.roles.length === 0) {
        console.log('Roles API returned empty data:', res);
      }
      this.aplicarFiltrosRoles();
    });
  }

  aplicarFiltrosRoles() {
    if (!this.filtrosRoles.nombre) {
      this.rolesFiltrados = [...this.roles];
    } else {
      const search = this.filtrosRoles.nombre.toLowerCase();
      this.rolesFiltrados = this.roles.filter(r => r.nombre.toLowerCase().includes(search));
    }
  }

  limpiarFiltrosRoles() {
    this.filtrosRoles.nombre = '';
    this.aplicarFiltrosRoles();
  }

  abrirModalRol(rol?: any) {
    this.isEditMode = !!rol;
    if (rol) {
      this.selectedId = rol.id;
      this.rolForm.patchValue(rol);
    } else {
      this.selectedId = null;
      this.rolForm.reset();
    }
    this.isRolModalOpen = true;
  }

  cerrarModalRol() {
    this.isRolModalOpen = false;
  }

  guardarRol() {
    if (this.rolForm.invalid) return;

    if (this.isEditMode && this.selectedId) {
      this.seguridadService.updateRol(this.selectedId, this.rolForm.value).subscribe(() => {
        this.cargarRoles();
        this.cerrarModalRol();
      });
    } else {
      this.seguridadService.createRol(this.rolForm.value).subscribe(() => {
        this.cargarRoles();
        this.cerrarModalRol();
      });
    }
  }

  eliminarRol(id: number) {
    if (confirm('¿Está seguro de eliminar este rol?')) {
      this.seguridadService.deleteRol(id).subscribe(() => this.cargarRoles());
    }
  }

  // --- USUARIOS ---
  cargarUsuarios() {
    this.permissionService.getUsuarios().subscribe(res => {
      this.usuarios = res;
      if (!this.usuarios || this.usuarios.length === 0) {
        console.log('Usuarios API returned empty data:', res);
      }
      this.aplicarFiltrosUsuarios();
    });
  }

  aplicarFiltrosUsuarios() {
    if (!this.filtrosUsuarios.nombreUsuario) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const search = this.filtrosUsuarios.nombreUsuario.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u => u.nombreUsuario.toLowerCase().includes(search));
    }
  }

  limpiarFiltrosUsuarios() {
    this.filtrosUsuarios.nombreUsuario = '';
    this.aplicarFiltrosUsuarios();
  }

  abrirModalUsuario(usuario?: any) {
    this.isEditMode = !!usuario;
    if (usuario) {
      this.selectedId = usuario.id;
      this.usuarioForm.patchValue({
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        rolId: usuario.rolId,
        activo: usuario.activo,
        passwordHash: '' // Do not pre-fill hash
      });
    } else {
      this.selectedId = null;
      this.usuarioForm.reset({ activo: true });
    }
    this.isUsuarioModalOpen = true;
  }

  cerrarModalUsuario() {
    this.isUsuarioModalOpen = false;
  }

  guardarUsuario() {
    if (this.usuarioForm.invalid) return;

    if (this.isEditMode && this.selectedId) {
      this.seguridadService.updateUsuario(this.selectedId, this.usuarioForm.value).subscribe(() => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
      });
    } else {
      this.seguridadService.createUsuario(this.usuarioForm.value).subscribe(() => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
      });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.seguridadService.deleteUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  // --- PERMISOS MATRIZ ---
  cargarPermisosRol() {
    if (!this.rolSeleccionadoId) {
      this.permisosActuales = [];
      return;
    }
    this.seguridadService.getPermisos(this.rolSeleccionadoId).subscribe(res => {
      this.permisosActuales = this.pantallasSistema.map(pantalla => {
        const permisoExistente = res.find((p: any) => p.pantallaId === pantalla);
        return permisoExistente || {
          roleId: this.rolSeleccionadoId,
          pantallaId: pantalla,
          puedeCrear: false,
          puedeEditar: false,
          puedeEliminar: false,
          puedeVer: false
        };
      });
    });
  }

  actualizarPermiso(permiso: any) {
    this.seguridadService.updatePermiso(permiso).subscribe({
      next: () => console.log(`Permiso actualizado para ${permiso.pantallaId}`),
      error: (err) => console.error(err)
    });
  }
}
