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
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Colaboradores</h2>

      <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input formControlName="codigoEmpleado" placeholder="Código Empleado" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
          <input formControlName="nombreCompleto" placeholder="Nombre Completo" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
          <input formControlName="correoInstitucional" placeholder="Correo Institucional" type="email" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
          <select formControlName="puestoId" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            <option [ngValue]="null">Seleccione un Puesto</option>
            @for(puesto of puestos; track puesto.id) {
              <option [ngValue]="puesto.id">{{puesto.nombrePuesto}}</option>
            }
          </select>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="empleadoForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50">
            @if(isEditing) {
              Actualizar
            } @else {
              Agregar
            }
          </button>

          @if(isEditing) {
            <button type="button" (click)="resetForm()" class="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-200">
              Cancelar
            </button>
          }
        </div>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gray-700 text-gray-200">
              <th class="p-3 border-b border-gray-600 font-semibold">Código</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Nombre</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Correo</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Puesto</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(emp of empleados; track emp.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{emp.codigoEmpleado}}</td>
                <td class="p-3">{{emp.nombreCompleto}}</td>
                <td class="p-3">{{emp.correoInstitucional}}</td>
                <td class="p-3">{{emp.nombrePuesto || 'No Asignado'}}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(emp)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(emp.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay colaboradores registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ColaboradoresComponent implements OnInit {
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  empleadoForm: FormGroup;
  isEditing = false;
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
    this.currentId = emp.id;
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

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.empleadoForm.reset({
      codigoEmpleado: '',
      nombreCompleto: '',
      correoInstitucional: '',
      puestoId: null
    });
  }
}
