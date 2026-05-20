import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HardwareAsignado, Empleado, Puesto } from '../../models/models';

@Component({
  selector: 'app-hardware',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Hardware Asignado</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">Formulario de Registro</h3></div>
<form [formGroup]="hwForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="empleadoId" (change)="onEmpleadoChange($event)" class="ucc-select">
              <option [ngValue]="null">Seleccione Persona</option>
              @for(emp of empleados; track emp.id) {
                <option [ngValue]="emp.id">{{emp.nombreCompleto}}</option>
              }
            </select>
            @if(hwForm.get('empleadoId')?.invalid && hwForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
            }
            <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Equipo (Tipo ej. Laptop)</label>
<input formControlName="tipoEquipo" placeholder="Equipo (Tipo ej. Laptop)" class="ucc-input">
            @if(hwForm.get('tipoEquipo')?.invalid && hwForm.get('tipoEquipo')?.touched) {
              <span class="text-red-400 text-xs mt-1">El tipo de equipo es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Procesador</label>
<input formControlName="procesador" placeholder="Procesador" class="ucc-input">
            @if(hwForm.get('procesador')?.invalid && hwForm.get('procesador')?.touched) {
              <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Memoria RAM</label>
<input formControlName="memoria" placeholder="Memoria RAM" class="ucc-input">
            @if(hwForm.get('memoria')?.invalid && hwForm.get('memoria')?.touched) {
              <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Disco Duro</label>
<input formControlName="disco" placeholder="Disco Duro" class="ucc-input">
            @if(hwForm.get('disco')?.invalid && hwForm.get('disco')?.touched) {
              <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Marca de PC</label>
<input formControlName="marcaPC" placeholder="Marca de PC" class="ucc-input">
            @if(hwForm.get('marcaPC')?.invalid && hwForm.get('marcaPC')?.touched) {
              <span class="text-red-400 text-xs mt-1">La marca es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Placa de Activo</label>
<input formControlName="placa" placeholder="Placa de Activo" class="ucc-input">
            @if(hwForm.get('placa')?.invalid && hwForm.get('placa')?.touched) {
              <span class="text-red-400 text-xs mt-1">La placa es requerida.</span>
            }
          </div>

          <div class="flex items-center pt-2">
            <label class="flex items-center text-white cursor-pointer select-none">
              <input type="checkbox" formControlName="tecladoNumerico" class="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800">
              Teclado Numérico
            </label>
          </div>

          <div class="flex flex-col lg:col-span-3">
            <label class="ucc-label">Otras Consideraciones</label>
<input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones" class="ucc-input">
          </div>
        </div>

        <div class="mt-4">
          <button type="submit" [disabled]="hwForm.invalid" class="ucc-btn-primary">
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
              <th>Puesto</th>
              <th>Nombre de persona</th>
              <th>Equipo</th>
              <th>Marca</th>
              <th>Placa</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(hw of equipos; track hw.id) {
              <tr>
                <td>{{getPuestoByEmpleado(hw.empleadoId)}}</td>
                <td>{{getEmpleadoName(hw.empleadoId)}}</td>
                <td>{{hw.tipoEquipo}}</td>
                <td>{{hw.marcaPC}}</td>
                <td>{{hw.placa}}</td>
                <td>
                  <button (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                    Editar
                  </button>
                  <button (click)="delete(hw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay hardware registrado en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
</section>
    </div>
  `
})
export class HardwareComponent implements OnInit {
  equipos: HardwareAsignado[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  hwForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;
  selectedEmpleadoPuestoId: number | undefined | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.hwForm = this.fb.group({
      empleadoId: [null, Validators.required],
      tipoEquipo: ['', Validators.required],
      procesador: ['', Validators.required],
      memoria: ['', Validators.required],
      disco: ['', Validators.required],
      marcaPC: ['', Validators.required],
      tecladoNumerico: [false],
      otrasConsideraciones: [''],
      placa: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getHardwareAsignado().subscribe(res => this.equipos = res);
    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  onEmpleadoChange(event: any) {
    const empId = this.hwForm.get('empleadoId')?.value;
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
    this.hwForm.markAllAsTouched();
    if (this.hwForm.invalid) return;

    const data = this.hwForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareAsignado(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro.')
      });
    } else {
      this.api.createHardwareAsignado(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro.')
      });
    }
  }

  edit(hw: HardwareAsignado) {
    this.isEditing = true;
    this.currentId = hw.id;
    this.hwForm.patchValue(hw);
    this.onEmpleadoChange(null);
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este equipo asignado?')) {
      this.api.deleteHardwareAsignado(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.hwForm.reset({
      empleadoId: null,
      tipoEquipo: '',
      procesador: '',
      memoria: '',
      disco: '',
      marcaPC: '',
      tecladoNumerico: false,
      otrasConsideraciones: '',
      placa: ''
    });
  }
}
