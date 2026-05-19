import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Plataforma, Empleado, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-plataformas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Plataformas y Licencias</h2>

      <form [formGroup]="plataformaForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <select formControlName="empleadoId" (change)="onEmpleadoChange($event)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option [ngValue]="null">Seleccione Empleado</option>
              @for(emp of empleados; track emp.id) {
                <option [ngValue]="emp.id">{{emp.nombreCompleto}}</option>
              }
            </select>
            @if(plataformaForm.get('empleadoId')?.invalid && plataformaForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
            }
            <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
          </div>

          <div class="flex flex-col">
            <select formControlName="licencias" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option value="">Posee Licencia?</option>
              @for(lic of tiposLicencia; track lic.id) {
                <option [value]="lic.nombre">{{lic.nombre}}</option>
              }
            </select>
            @if(plataformaForm.get('licencias')?.invalid && plataformaForm.get('licencias')?.touched) {
              <span class="text-red-400 text-xs mt-1">La licencia es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <select formControlName="nombrePlataforma" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option value="">Seleccione Plataforma</option>
              @for(plat of plataformasNombres; track plat.id) {
                <option [value]="plat.nombre">{{plat.nombre}}</option>
              }
            </select>
            @if(plataformaForm.get('nombrePlataforma')?.invalid && plataformaForm.get('nombrePlataforma')?.touched) {
              <span class="text-red-400 text-xs mt-1">La plataforma es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="modulos" placeholder="Módulos" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(plataformaForm.get('modulos')?.invalid && plataformaForm.get('modulos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los módulos son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <input formControlName="accesosPermisos" placeholder="Accesos y Permisos" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
            @if(plataformaForm.get('accesosPermisos')?.invalid && plataformaForm.get('accesosPermisos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los accesos son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <select formControlName="nivelAcceso" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option value="">Nivel de Acceso</option>
              @for(nivel of nivelesAcceso; track nivel.id) {
                <option [value]="nivel.nombre">{{nivel.nombre}}</option>
              }
            </select>
            @if(plataformaForm.get('nivelAcceso')?.invalid && plataformaForm.get('nivelAcceso')?.touched) {
              <span class="text-red-400 text-xs mt-1">El nivel de acceso es requerido.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="plataformaForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <th class="p-3 border-b border-gray-600 font-semibold">Licencia</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Plataforma</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Módulos</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Accesos</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Nivel</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(plat of plataformas; track plat.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3">{{ getEmpleadoName(plat.empleadoId) }}</td>
                <td class="p-3">{{ getPuestoByEmpleado(plat.empleadoId) }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-800 text-green-200': plat.licencias === 'Posee',
                          'bg-gray-600 text-gray-300': plat.licencias !== 'Posee'
                        }">
                    {{ plat.licencias }}
                  </span>
                </td>
                <td class="p-3">{{ plat.nombrePlataforma }}</td>
                <td class="p-3">{{ plat.modulos }}</td>
                <td class="p-3">{{ plat.accesosPermisos }}</td>
                <td class="p-3">{{ plat.nivelAcceso }}</td>
                <td class="p-3 text-center">
                  <button (click)="edit(plat)" class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(plat.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay plataformas registradas en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PlataformasComponent implements OnInit {
  plataformas: Plataforma[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  plataformaForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;
  selectedEmpleadoPuestoId: number | undefined | null = null;

  // Catálogos dinámicos
  nivelesAcceso: Catalogo[] = [];
  plataformasNombres: Catalogo[] = [];
  tiposLicencia: Catalogo[] = [];

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.plataformaForm = this.fb.group({
      empleadoId: [null, Validators.required],
      licencias: ['', Validators.required],
      nombrePlataforma: ['', Validators.required],
      modulos: ['', Validators.required],
      accesosPermisos: ['', Validators.required],
      nivelAcceso: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadCatalogos();
  }

  loadData() {
    this.api.getPlataformas().subscribe(res => this.plataformas = res);
    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  loadCatalogos() {
    this.api.getNivelesAcceso().subscribe(res => this.nivelesAcceso = res);
    this.api.getPlataformasNombres().subscribe(res => this.plataformasNombres = res);
    this.api.getTiposLicencia().subscribe(res => this.tiposLicencia = res);
  }

  onEmpleadoChange(event: any) {
    const empId = this.plataformaForm.get('empleadoId')?.value;
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
    this.plataformaForm.markAllAsTouched();
    if (this.plataformaForm.invalid) return;

    const data = this.plataformaForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updatePlataforma(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro de plataforma.')
      });
    } else {
      this.api.createPlataforma(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro de plataforma.')
      });
    }
  }

  edit(plat: Plataforma) {
    this.isEditing = true;
    this.currentId = plat.id;
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso
    });
    this.onEmpleadoChange(null);
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.api.deletePlataforma(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.plataformaForm.reset({
      empleadoId: null,
      licencias: '',
      nombrePlataforma: '',
      modulos: '',
      accesosPermisos: '',
      nivelAcceso: ''
    });
  }
}
