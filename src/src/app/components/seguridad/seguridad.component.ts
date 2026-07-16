import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '../../services/permission.service';
import { PermisoDirective } from '../../directives/permiso.directive';

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
  pantallasSistema: string[] = [];
  hasUnsavedChanges = false;

  constructor(
    private permissionService: PermissionService,
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
    this.permissionService.loadRoles().subscribe({
      next: (res) => {
        this.roles = res || [];
        this.aplicarFiltrosRoles();
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
        alert('Ocurrió un error al cargar los roles.');
      }
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
      this.permissionService.updateRol(this.selectedId, this.rolForm.value).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalRol();
        },
        error: (err) => {
          console.error('Error al actualizar rol', err);
          alert('Error al actualizar el rol.');
        }
      });
    } else {
      this.permissionService.createRol(this.rolForm.value).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalRol();
        },
         error: (err) => {
          console.error('Error al crear rol', err);
          alert('Error al crear el rol.');
        }
      });
    }
  }

  eliminarRol(id: number) {
    if (confirm('¿Está seguro de eliminar este rol?')) {
      this.permissionService.deleteRol(id).subscribe({
        next: () => this.cargarRoles(),
        error: (err) => {
            console.error('Error al eliminar rol', err);
            alert('Error al eliminar el rol. ' + (err.error?.message || ''));
        }
      });
    }
  }

  // --- USUARIOS ---
  cargarUsuarios() {
    this.permissionService.getUsuarios().subscribe(res => {
      this.usuarios = res || [];
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
      this.permissionService.updateUsuario(this.selectedId, this.usuarioForm.value).subscribe(() => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
      });
    } else {
      this.permissionService.createUsuario(this.usuarioForm.value).subscribe(() => {
        this.cargarUsuarios();
        this.cerrarModalUsuario();
      });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.permissionService.deleteUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }

  // --- PERMISOS MATRIZ ---
  cargarPermisosRol() {
    this.hasUnsavedChanges = false;
    if (!this.rolSeleccionadoId) {
      this.permisosActuales = [];
      return;
    }
    this.permissionService.getPermisos(this.rolSeleccionadoId).subscribe(res => {
      // El componente ahora renderiza la fila iterando directamente sobre la lista que trae el SP
      // ya que el SP siempre trae todos los permisos existentes en bd.
      this.permisosActuales = res || [];
    });
  }

  marcarComoModificado() {
    this.hasUnsavedChanges = true;
  }

  guardarPermisosMatriz() {
    if (!this.rolSeleccionadoId) return;

    this.permissionService.guardarPermisos(this.rolSeleccionadoId, this.permisosActuales).subscribe({
      next: () => {
        alert('Permisos guardados exitosamente');
        this.hasUnsavedChanges = false;
      },
      error: (err) => {
        console.error('Error al guardar permisos', err);
        alert('Error al guardar los permisos');
      }
    });
  }
}
