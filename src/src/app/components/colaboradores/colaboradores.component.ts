import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Empleado, Puesto } from '../../models/models';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Colaboradores</h2>
        <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
          Administre la información del personal y asigne los puestos correspondientes dentro de la organización.
        </p>
      </div>

      <section class="ucc-card">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">add_circle</span>
          <h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles del Colaborador' : (isEditing ? 'Editar Colaborador' : 'Registrar Colaborador') }}</h3>
        </div>

        <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="ucc-label">Código Empleado</label>
              <input formControlName="codigoEmpleado" placeholder="Ej: EMP-001" class="ucc-input">
              @if(empleadoForm.get('codigoEmpleado')?.invalid && empleadoForm.get('codigoEmpleado')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">El código es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Nombre Completo</label>
              <input formControlName="nombreCompleto" placeholder="Nombre completo" class="ucc-input">
              @if(empleadoForm.get('nombreCompleto')?.invalid && empleadoForm.get('nombreCompleto')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">El nombre completo es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Correo Institucional</label>
              <input formControlName="correoInstitucional" placeholder="correo@ucc.edu" type="email" class="ucc-input">
              @if(empleadoForm.get('correoInstitucional')?.invalid && empleadoForm.get('correoInstitucional')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">Un correo válido es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Puesto Asignado</label>
              <select formControlName="puestoId" class="ucc-select">
                <option [ngValue]="null">Seleccione un Puesto</option>
                @for(puesto of puestos; track puesto.id) {
                  <option [ngValue]="puesto.id">{{puesto.nombrePuesto}}</option>
                }
              </select>
            </div>
          </div>

          <div class="flex gap-4 mt-6">
            @if(!isReadOnly) {
  <button type="submit" [disabled]="empleadoForm.invalid" class="ucc-btn-primary w-full md:w-auto">
    @if(isEditing) {
      <span class="material-symbols-outlined">save</span> Actualizar
    } @else {
      <span class="material-symbols-outlined">add</span> Agregar
    }
  </button>
}

            @if(isEditing || isReadOnly) {
  <button type="button" (click)="resetForm()" class="ucc-btn-secondary w-full md:w-auto">
    {{ isReadOnly ? 'Volver' : 'Cancelar' }}
  </button>
}
          </div>
        </form>
      </section>

      <section class="ucc-table-container">
        <div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/20 bg-ucc-secondary">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">group</span> Colaboradores Registrados
          </h3>
        </div>

        <table class="ucc-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Puesto</th>
              <th class="text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(emp of empleados; track emp.id) {
              <tr>
                <td class="font-bold">{{emp.codigoEmpleado}}</td>
                <td>{{emp.nombreCompleto}}</td>
                <td>{{emp.correoInstitucional}}</td>
                <td>
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-ucc-primary-container/10 text-ucc-primary text-[11px] font-bold">
                    {{emp.nombrePuesto || 'No Asignado'}}
                  </span>
                </td>
                <td>
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(emp)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
<span class="material-symbols-outlined">visibility</span>
</button>
<button (click)="edit(emp)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button (click)="delete(emp.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="py-8 px-6 text-center text-ucc-neutral-variant">
                  No hay colaboradores registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class ColaboradoresComponent implements OnInit {
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  empleadoForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.empleadoForm = this.fb.group({
      codigoEmpleado: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      correoInstitucional: ['', [Validators.required, Validators.email]],
      puestoId: [null]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPuestos().subscribe({
      next: (res) => this.puestos = res,
      error: (err) => console.error('Error al cargar puestos', err)
    });

    this.api.getEmpleados().subscribe({
      next: (res) => this.empleados = res,
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  onSubmit() {
    this.empleadoForm.markAllAsTouched();
    if (this.empleadoForm.invalid) return;

    const data = this.empleadoForm.value;

    if (this.isEditing && this.currentId) {
      this.api.updateEmpleado(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar empleado.')
      });
    } else {
      this.api.createEmpleado(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear empleado.')
      });
    }
  }

  edit(emp: Empleado) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = emp.id;
    this.empleadoForm.enable();
    this.empleadoForm.patchValue({
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: emp.nombreCompleto,
      correoInstitucional: emp.correoInstitucional,
      puestoId: emp.puestoId || null
    });
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este colaborador?')) {
      this.api.deleteEmpleado(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Error al eliminar empleado. Verifique si tiene hardware/software asignado.')
      });
    }
  }

  verDetalle(emp: Empleado) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = emp.id;
    this.empleadoForm.patchValue({
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: emp.nombreCompleto,
      correoInstitucional: emp.correoInstitucional,
      puestoId: emp.puestoId || null
    });
    this.empleadoForm.disable();
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.empleadoForm.reset({
      codigoEmpleado: '',
      nombreCompleto: '',
      correoInstitucional: '',
      puestoId: null
    });
    this.empleadoForm.enable();
  }
}
