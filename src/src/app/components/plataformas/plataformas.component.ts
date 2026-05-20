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
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Plataformas y Licencias</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">Formulario de Registro</h3></div>
<form [formGroup]="plataformaForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="empleadoId" (change)="onEmpleadoChange($event)" class="ucc-select">
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
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="licencias" class="ucc-select">
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
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="nombrePlataforma" class="ucc-select">
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
            <label class="ucc-label">Módulos</label>
<input formControlName="modulos" placeholder="Módulos" class="ucc-input">
            @if(plataformaForm.get('modulos')?.invalid && plataformaForm.get('modulos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los módulos son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Accesos y Permisos</label>
<input formControlName="accesosPermisos" placeholder="Accesos y Permisos" class="ucc-input">
            @if(plataformaForm.get('accesosPermisos')?.invalid && plataformaForm.get('accesosPermisos')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los accesos son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="nivelAcceso" class="ucc-select">
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
          <button type="submit" [disabled]="plataformaForm.invalid" class="ucc-btn-primary">
            @if(isEditing) {
              Actualizar
            } @else {
              Agregar
            }
          </button>

          @if(isEditing) {
            <button type="button" (click)="resetForm()" class="ucc-btn-secondary">
              Cancelar
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
              <th>Licencia</th>
              <th>Plataforma</th>
              <th>Módulos</th>
              <th>Accesos</th>
              <th>Nivel</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(plat of plataformas; track plat.id) {
              <tr>
                <td>{{ getEmpleadoName(plat.empleadoId) }}</td>
                <td>{{ getPuestoByEmpleado(plat.empleadoId) }}</td>
                <td>
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-800 text-green-200': plat.licencias === 'Posee',
                          'bg-gray-600 text-gray-300': plat.licencias !== 'Posee'
                        }">
                    {{ plat.licencias }}
                  </span>
                </td>
                <td>{{ plat.nombrePlataforma }}</td>
                <td>{{ plat.modulos }}</td>
                <td>{{ plat.accesosPermisos }}</td>
                <td>{{ plat.nivelAcceso }}</td>
                <td>
                  <button (click)="edit(plat)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(plat.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay plataformas registradas en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
</section>
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
