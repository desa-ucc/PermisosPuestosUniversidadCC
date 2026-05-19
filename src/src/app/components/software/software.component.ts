import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SoftwareLocal, HardwareAsignado } from '../../models/models';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Software Local</h2>

      <form [formGroup]="swForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <select formControlName="empleadoId" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option [ngValue]="null">Seleccione Equipo/Empleado</option>
              @for(eq of equipos; track eq.id) {
                <option [ngValue]="eq.empleadoId">{{eq.placa}} - {{eq.marcaPC}}</option>
              }
            </select>
            @if(swForm.get('empleadoId')?.invalid && swForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El equipo/empleado es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="equipo" placeholder="Nombre Equipo en Red" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(swForm.get('equipo')?.invalid && swForm.get('equipo')?.touched) {
              <span class="text-red-400 text-xs mt-1">El equipo en red es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="gruposAD" placeholder="Grupos AD" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(swForm.get('gruposAD')?.invalid && swForm.get('gruposAD')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los grupos AD son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="nombreSoftware" placeholder="Nombre Software" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(swForm.get('nombreSoftware')?.invalid && swForm.get('nombreSoftware')?.touched) {
              <span class="text-red-400 text-xs mt-1">El nombre de software es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="version" placeholder="Versión" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(swForm.get('version')?.invalid && swForm.get('version')?.touched) {
              <span class="text-red-400 text-xs mt-1">La versión es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="fabricante" placeholder="Fabricante" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(swForm.get('fabricante')?.invalid && swForm.get('fabricante')?.touched) {
              <span class="text-red-400 text-xs mt-1">El fabricante es requerido.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="swForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <th class="p-3 border-b border-gray-600 font-semibold">Equipo Asignado</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Software</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Versión</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Fabricante</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(sw of softwareList; track sw.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{getEquipoPlaca(sw.empleadoId)}}</td>
                <td class="p-3">{{sw.nombreSoftware}}</td>
                <td class="p-3">{{sw.version}}</td>
                <td class="p-3">{{sw.fabricante}}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(sw)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(sw.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay registros de software local.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SoftwareComponent implements OnInit {
  softwareList: SoftwareLocal[] = [];
  equipos: HardwareAsignado[] = [];
  swForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.swForm = this.fb.group({
      empleadoId: [null, Validators.required],
      equipo: ['', Validators.required],
      gruposAD: ['', Validators.required],
      nombreSoftware: ['', Validators.required],
      version: ['', Validators.required],
      fabricante: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getSoftwareLocales().subscribe(res => this.softwareList = res);
    this.api.getHardwareAsignado().subscribe(res => this.equipos = res);
  }

  getEquipoPlaca(empleadoId: number): string {
    return this.equipos.find(e => e.empleadoId === empleadoId)?.placa || 'Desconocido';
  }

  onSubmit() {
    this.swForm.markAllAsTouched();
    if (this.swForm.invalid) return;

    const data = this.swForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateSoftwareLocal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro de software.')
      });
    } else {
      this.api.createSoftwareLocal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro de software.')
      });
    }
  }

  edit(sw: SoftwareLocal) {
    this.isEditing = true;
    this.currentId = sw.id;
    this.swForm.patchValue(sw);
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este registro de software?')) {
      this.api.deleteSoftwareLocal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.swForm.reset({
      empleadoId: null,
      equipo: '',
      gruposAD: '',
      nombreSoftware: '',
      version: '',
      fabricante: ''
    });
  }
}
