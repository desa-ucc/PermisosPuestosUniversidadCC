import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HardwareAsignado, Empleado, Puesto } from '../../models/models';

@Component({
  selector: 'app-hardware',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Hardware Asignado</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Hardware' : (isEditing ? 'Editar Hardware' : 'Registrar Hardware') }}</h3></div>
<form [formGroup]="hwForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar empleado..."
                     [(ngModel)]="searchTermEmpleados"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownEmpleados = true"
                     (blur)="cerrarDropdownEmpleados()"
                     [disabled]="isReadOnly">

              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownEmpleados || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarEmpleado(null)">
                  Ninguno
                </li>
                @for(emp of empleadosFiltrados; track emp.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarEmpleado(emp)">
                    {{emp.nombreCompleto}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
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
          @if(!isReadOnly) {
  <button type="submit" [disabled]="hwForm.invalid" class="ucc-btn-primary">
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
              <th>Puesto</th>
              <th>Nombre de persona</th>
              <th>Equipo</th>
              <th>Marca</th>
              <th>Placa</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(hw of paginatedList; track hw.id) {
              <tr>
                <td>{{getPuestoByEmpleado(hw.empleadoId)}}</td>
                <td>{{getEmpleadoName(hw.empleadoId)}}</td>
                <td>{{hw.tipoEquipo}}</td>
                <td>{{hw.marcaPC}}</td>
                <td>{{hw.placa}}</td>
                <td>
                  <div class="flex justify-center gap-3"><button (click)="verDetalle(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button (click)="delete(hw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button></div>
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

        <!-- FOOTER PAGINACIÓN DINÁMICA -->
        <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface rounded-b-lg">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ucc-neutral-variant">Mostrar:</span>
            <select class="ucc-input py-1 px-2 text-sm w-20" (change)="changePageSize($event)">
              @for(size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{size}}</option>
              }
            </select>
          </div>

          <span class="text-sm font-medium text-ucc-neutral-variant">Mostrando página {{currentPage}} de {{totalPages}}</span>

          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="currentPage === 1" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface transition-all">Anterior</button>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface transition-all">Siguiente</button>
          </div>
        </div>

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
  isReadOnly = false;
  currentId: number | null = null;

  // Buscador Autocompletado: Empleados
  showDropdownEmpleados = false;
  searchTermEmpleados = '';

  get empleadosFiltrados() {
    return this.empleados.filter(e => e.nombreCompleto.toLowerCase().includes(this.searchTermEmpleados.toLowerCase()));
  }

  seleccionarEmpleado(empleado: Empleado | null) {
    if (empleado) {
        this.hwForm.patchValue({ empleadoId: empleado.id });
        this.searchTermEmpleados = empleado.nombreCompleto;
    } else {
        this.hwForm.patchValue({ empleadoId: null });
        this.searchTermEmpleados = '';
    }
    this.showDropdownEmpleados = false;
    this.onEmpleadoChange(null);
  }

  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.hwForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEmpleados = '';
      } else {
          const matched = this.empleados.find(e => e.id === currentId);
          if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }


  // Paginación Dinámica
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.equipos.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.equipos.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.currentPage = 1;
  }

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
    this.isReadOnly = false;
    this.currentId = hw.id;
    this.hwForm.enable();
    this.searchTermEmpleados = '';
    this.hwForm.patchValue(hw);
    if (hw.empleadoId) {
        const matched = this.empleados.find(e => e.id === hw.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
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

  verDetalle(hw: HardwareAsignado) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwForm.patchValue(hw);
    this.onEmpleadoChange(null);
    this.hwForm.disable();
    if (hw.empleadoId) {
        const matched = this.empleados.find(e => e.id === hw.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
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
    this.hwForm.enable();
    this.searchTermEmpleados = '';
  }
}
