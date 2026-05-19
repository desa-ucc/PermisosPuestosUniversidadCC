import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Puesto } from '../../models/models';

@Component({
  selector: 'app-puestos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Mantenimiento de Puestos</h2>

      <form [formGroup]="puestoForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <input formControlName="codigoPuesto" placeholder="Código (ej. IT-01)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(puestoForm.get('codigoPuesto')?.invalid && puestoForm.get('codigoPuesto')?.touched) {
              <span class="text-red-400 text-xs mt-1">El código es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="nombrePuesto" placeholder="Nombre del Puesto" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(puestoForm.get('nombrePuesto')?.invalid && puestoForm.get('nombrePuesto')?.touched) {
              <span class="text-red-400 text-xs mt-1">El nombre es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="descripcion" placeholder="Descripción" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="puestoForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <th class="p-3 border-b border-gray-600 font-semibold">Descripción</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(puesto of puestos; track puesto.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{puesto.codigoPuesto}}</td>
                <td class="p-3">{{puesto.nombrePuesto}}</td>
                <td class="p-3">{{puesto.descripcion || 'N/A'}}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(puesto)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(puesto.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay puestos registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PuestosComponent implements OnInit {
  puestos: Puesto[] = [];
  puestoForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.puestoForm = this.fb.group({
      codigoPuesto: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      descripcion: ['']
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
  }

  onSubmit() {
    this.puestoForm.markAllAsTouched();
    if (this.puestoForm.invalid) return;

    const data = this.puestoForm.value;

    if (this.isEditing && this.currentId) {
      this.api.updatePuesto(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar el puesto.')
      });
    } else {
      this.api.createPuesto(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear el puesto.')
      });
    }
  }

  edit(puesto: Puesto) {
    this.isEditing = true;
    this.currentId = puesto.id;
    this.puestoForm.patchValue({
      codigoPuesto: puesto.codigoPuesto,
      nombrePuesto: puesto.nombrePuesto,
      descripcion: puesto.descripcion
    });
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este puesto?')) {
      this.api.deletePuesto(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar. Verifique que no esté asignado a ningún colaborador o equipo ideal.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.puestoForm.reset();
  }
}
