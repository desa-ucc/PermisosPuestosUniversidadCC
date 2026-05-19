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
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Permisos por Sitio</h2>

      <form [formGroup]="sitioForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <select formControlName="empleadoId" (change)="onEmpleadoChange($event)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
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
            <select formControlName="sitio" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
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
            <select formControlName="ambiente" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
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
            <input formControlName="gruposPermisos" placeholder="Grupos de Permisos (ej. Soporte-Consulta)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full">
            @if(sitioForm.get('gruposPermisos')?.invalid && sitioForm.get('gruposPermisos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los grupos son requeridos.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="sitioForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <th class="p-3 border-b border-gray-600 font-semibold">Persona</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Puesto</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Sitio</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Ambiente</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Grupos Permisos</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(sitio of permisosSitios; track sitio.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{ getEmpleadoName(sitio.empleadoId) }}</td>
                <td class="p-3">{{ getPuestoByEmpleado(sitio.empleadoId) }}</td>
                <td class="p-3">{{ sitio.sitio }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-800 text-green-200': sitio.ambiente === 'Producción',
                          'bg-yellow-800 text-yellow-200': sitio.ambiente === 'Pruebas',
                          'bg-blue-800 text-blue-200': sitio.ambiente === 'Desarrollo'
                        }">
                    {{ sitio.ambiente }}
                  </span>
                </td>
                <td class="p-3">{{ sitio.gruposPermisos }}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(sitio)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(sitio.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay permisos de sitio registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SitiosComponent implements OnInit {
  permisosSitios: PermisosSitio[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  sitioForm: FormGroup;
  isEditing = false;
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
    this.currentId = sitio.id;
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

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.sitioForm.reset({
      empleadoId: null,
      sitio: '',
      ambiente: '',
      gruposPermisos: ''
    });
  }
}
