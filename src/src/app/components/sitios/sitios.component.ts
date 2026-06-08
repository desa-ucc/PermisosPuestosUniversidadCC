import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisosSitio, Empleado, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-sitios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Permisos por Sitio</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Permisos Sitio' : (isEditing ? 'Editar Permisos Sitio' : 'Registrar Permisos Sitio') }}</h3></div>
<form [formGroup]="sitioForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="empleadoId" (change)="onEmpleadoChange($event)" class="ucc-select">
              <option [ngValue]="null">Seleccione Empleado</option>
              @for(emp of empleados; track emp.id) {
                <option [ngValue]="emp.id">{{emp.nombreCompleto}}</option>
              }
            </select>
            @if(sitioForm.get('empleadoId')?.invalid && sitioForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
            }
            <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="sitio" class="ucc-select">
              <option value="">Seleccione Sitio</option>
              @for(sitio of sitiosOpciones; track sitio.id) {
                <option [value]="sitio.nombre">{{sitio.nombre}}</option>
              }
            </select>
            @if(sitioForm.get('sitio')?.invalid && sitioForm.get('sitio')?.touched) {
              <span class="text-red-400 text-xs mt-1">El sitio es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="ambiente" class="ucc-select">
              <option value="">Seleccione Ambiente</option>
              @for(amb of ambientesOpciones; track amb.id) {
                <option [value]="amb.nombre">{{amb.nombre}}</option>
              }
            </select>
            @if(sitioForm.get('ambiente')?.invalid && sitioForm.get('ambiente')?.touched) {
              <span class="text-red-400 text-xs mt-1">El ambiente es requerido.</span>
            }
          </div>

          <div class="flex flex-col lg:col-span-3">
            <label class="ucc-label">Grupos de Permisos (ej. Soporte-Consulta)</label>
<input formControlName="gruposPermisos" placeholder="Grupos de Permisos (ej. Soporte-Consulta)" class="ucc-input">
            @if(sitioForm.get('gruposPermisos')?.invalid && sitioForm.get('gruposPermisos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los grupos son requeridos.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          @if(!isReadOnly) {
  <button type="submit" [disabled]="sitioForm.invalid" class="ucc-btn-primary">
    @if(isEditing) {
      Actualizar
    } @else {
      Agregar
    }
  </button>
}

          @if(isEditing || isReadOnly) {
  <button type="button" (click)="resetForm()" class="ucc-btn-secondary">
    {{ isReadOnly ? 'Volver' : 'Cancelar' }}
  </button>
}
        </div>
      </form>
</section>

      <section class="ucc-table-container">
<div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/20 bg-ucc-secondary"><h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">table_chart</span> Registros Actuales</h3></div>
<table class="ucc-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Puesto</th>
              <th>Sitio</th>
              <th>Ambiente</th>
              <th>Grupos Permisos</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(sitio of permisosSitios; track sitio.id) {
              <tr>
                <td>{{ getEmpleadoName(sitio.empleadoId) }}</td>
                <td>{{ getPuestoByEmpleado(sitio.empleadoId) }}</td>
                <td>{{ sitio.sitio }}</td>
                <td>
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-800 text-green-200': sitio.ambiente === 'Producción',
                          'bg-yellow-800 text-yellow-200': sitio.ambiente === 'Pruebas',
                          'bg-blue-800 text-blue-200': sitio.ambiente === 'Desarrollo'
                        }">
                    {{ sitio.ambiente }}
                  </span>
                </td>
                <td>{{ sitio.gruposPermisos }}</td>
                <td>
                  <div class="flex justify-center gap-3"><button (click)="verDetalle(sitio)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button (click)="edit(sitio)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button (click)="delete(sitio.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button></div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay permisos de sitio registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
</section>
    </div>
  `
})
export class SitiosComponent implements OnInit {
  permisosSitios: PermisosSitio[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  sitioForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;
  selectedEmpleadoPuestoId: number | undefined | null = null;

  // Catálogos dinámicos
  ambientesOpciones: Catalogo[] = [];
  sitiosOpciones: Catalogo[] = [];

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.sitioForm = this.fb.group({
      empleadoId: [null, Validators.required],
      sitio: ['', Validators.required],
      ambiente: ['', Validators.required],
      gruposPermisos: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPermisosSitios().subscribe(res => this.permisosSitios = res);
    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
    this.api.getAmbientes().subscribe(res => this.ambientesOpciones = res);
    this.api.getSitiosCat().subscribe(res => this.sitiosOpciones = res);
  }

  onEmpleadoChange(event: any) {
    const empId = this.sitioForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find(e => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getEmpleadoName(id: number): string {
    return this.empleados.find(e => e.id === id)?.nombreCompleto || 'Desconocido';
  }

  getPuestoByEmpleado(empleadoId: number): string {
    const emp = this.empleados.find(e => e.id === empleadoId);
    if (!emp || !emp.puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === emp.puestoId)?.nombrePuesto || 'Desconocido';
  }

  getPuestoName(puestoId: number | undefined | null): string {
    if (!puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
  }

  onSubmit() {
    this.sitioForm.markAllAsTouched();
    if (this.sitioForm.invalid) return;

    const data = this.sitioForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updatePermisosSitio(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar permisos de sitio.')
      });
    } else {
      this.api.createPermisosSitio(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear permisos de sitio.')
      });
    }
  }

  edit(sitio: PermisosSitio) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sitio.id;
    this.sitioForm.enable();
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null); // Update UI
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este permiso?')) {
      this.api.deletePermisosSitio(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(sitio: PermisosSitio) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sitio.id;
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null);
    this.sitioForm.disable();
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.sitioForm.reset({
      empleadoId: null,
      sitio: '',
      ambiente: '',
      gruposPermisos: ''
    });
    this.sitioForm.enable();
  }
}
