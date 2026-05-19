import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HardwareIdeal, Puesto } from '../../models/models';

@Component({
  selector: 'app-hardware-ideal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Especificaciones: Equipo Ideal</h2>

      <form [formGroup]="hwIdealForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <select formControlName="puestoId" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option [ngValue]="null">Seleccione Puesto</option>
              @for(puesto of puestos; track puesto.id) {
                <option [ngValue]="puesto.id">{{puesto.nombrePuesto}}</option>
              }
            </select>
            @if(hwIdealForm.get('puestoId')?.invalid && hwIdealForm.get('puestoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El puesto es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="tipoEquipo" placeholder="Equipo (Tipo ej. Desktop)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(hwIdealForm.get('tipoEquipo')?.invalid && hwIdealForm.get('tipoEquipo')?.touched) {
              <span class="text-red-400 text-xs mt-1">El tipo de equipo es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="procesador" placeholder="Procesador (Mínimo recomendado)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(hwIdealForm.get('procesador')?.invalid && hwIdealForm.get('procesador')?.touched) {
              <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="memoria" placeholder="Memoria RAM recomendada" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(hwIdealForm.get('memoria')?.invalid && hwIdealForm.get('memoria')?.touched) {
              <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="disco" placeholder="Disco Duro" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(hwIdealForm.get('disco')?.invalid && hwIdealForm.get('disco')?.touched) {
              <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="marcaPC" placeholder="Marca de PC Estándar" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(hwIdealForm.get('marcaPC')?.invalid && hwIdealForm.get('marcaPC')?.touched) {
              <span class="text-red-400 text-xs mt-1">La marca es requerida.</span>
            }
          </div>

          <div class="flex items-center pt-2">
            <label class="flex items-center text-white cursor-pointer select-none">
              <input type="checkbox" formControlName="tecladoNumerico" class="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800">
              Requiere Teclado Numérico
            </label>
          </div>

          <div class="flex flex-col lg:col-span-2">
            <input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones / Periféricos" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full">
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="hwIdealForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            @if(isEditing) {
              Actualizar
            } @else {
              Agregar Plantilla
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
              <th class="p-3 border-b border-gray-600 font-semibold">Puesto Relacionado</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Equipo Base</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Procesador</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Memoria</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(hw of equiposIdeales; track hw.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{getPuestoName(hw.puestoId)}}</td>
                <td class="p-3">{{hw.tipoEquipo}}</td>
                <td class="p-3">{{hw.procesador}}</td>
                <td class="p-3">{{hw.memoria}}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(hw)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(hw.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay especificaciones de equipo ideal registradas.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class HardwareIdealComponent implements OnInit {
  equiposIdeales: HardwareIdeal[] = [];
  puestos: Puesto[] = [];
  hwIdealForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.hwIdealForm = this.fb.group({
      puestoId: [null, Validators.required],
      tipoEquipo: ['', Validators.required],
      procesador: ['', Validators.required],
      memoria: ['', Validators.required],
      disco: ['', Validators.required],
      marcaPC: ['', Validators.required],
      tecladoNumerico: [false],
      otrasConsideraciones: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getHardwareIdeal().subscribe({
      next: (res) => this.equiposIdeales = res,
      error: (err) => console.error('Error al cargar equipos ideales', err)
    });
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  getPuestoName(puestoId: number): string {
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
  }

  onSubmit() {
    this.hwIdealForm.markAllAsTouched();
    if (this.hwIdealForm.invalid) return;

    const data = this.hwIdealForm.value;
    data.puestoId = Number(data.puestoId);

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareIdeal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar plantilla.')
      });
    } else {
      this.api.createHardwareIdeal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear plantilla.')
      });
    }
  }

  edit(hw: HardwareIdeal) {
    this.isEditing = true;
    this.currentId = hw.id;
    this.hwIdealForm.patchValue(hw);
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este equipo ideal?')) {
      this.api.deleteHardwareIdeal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.hwIdealForm.reset({
      puestoId: null,
      tipoEquipo: '',
      procesador: '',
      memoria: '',
      disco: '',
      marcaPC: '',
      tecladoNumerico: false,
      otrasConsideraciones: ''
    });
  }
}
