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
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Especificaciones: Equipo Ideal</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles del Equipo Ideal' : (isEditing ? 'Editar Plantilla' : 'Formulario de Registro') }}</h3></div>
<form [formGroup]="hwIdealForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<select formControlName="puestoId" class="ucc-select">
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
            <label class="ucc-label">Equipo (Tipo ej. Desktop)</label>
<input formControlName="tipoEquipo" placeholder="Equipo (Tipo ej. Desktop)" class="ucc-input">
            @if(hwIdealForm.get('tipoEquipo')?.invalid && hwIdealForm.get('tipoEquipo')?.touched) {
              <span class="text-red-400 text-xs mt-1">El tipo de equipo es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Procesador (Mínimo recomendado)</label>
<input formControlName="procesador" placeholder="Procesador (Mínimo recomendado)" class="ucc-input">
            @if(hwIdealForm.get('procesador')?.invalid && hwIdealForm.get('procesador')?.touched) {
              <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Memoria RAM recomendada</label>
<input formControlName="memoria" placeholder="Memoria RAM recomendada" class="ucc-input">
            @if(hwIdealForm.get('memoria')?.invalid && hwIdealForm.get('memoria')?.touched) {
              <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Disco Duro</label>
<input formControlName="disco" placeholder="Disco Duro" class="ucc-input">
            @if(hwIdealForm.get('disco')?.invalid && hwIdealForm.get('disco')?.touched) {
              <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Marca de PC Estándar</label>
<input formControlName="marcaPC" placeholder="Marca de PC Estándar" class="ucc-input">
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
            <label class="ucc-label">Otras Consideraciones / Periféricos</label>
<input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones / Periféricos" class="ucc-input">
          </div>
        </div>

        <div class="mt-4">
          @if(!isReadOnly) {
  <button type="submit" [disabled]="hwIdealForm.invalid" class="ucc-btn-primary">
    @if(isEditing) {
      Actualizar
    } @else {
      Agregar Plantilla
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
              <th>Puesto Relacionado</th>
              <th>Equipo Base</th>
              <th>Procesador</th>
              <th>Memoria</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(hw of paginatedList; track hw.id) {
              <tr>
                <td>{{getPuestoName(hw.puestoId)}}</td>
                <td>{{hw.tipoEquipo}}</td>
                <td>{{hw.procesador}}</td>
                <td>{{hw.memoria}}</td>
                <td>
                  <button (click)="verDetalle(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button (click)="delete(hw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay especificaciones de equipo ideal registradas.
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
export class HardwareIdealComponent implements OnInit {
  equiposIdeales: HardwareIdeal[] = [];
  puestos: Puesto[] = [];
  hwIdealForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  // Paginación Dinámica
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.equiposIdeales.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.equiposIdeales.length / this.pageSize) || 1;
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
    this.isReadOnly = false;
    this.currentId = hw.id;
    this.hwIdealForm.enable();
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

  verDetalle(hw: HardwareIdeal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwIdealForm.patchValue(hw);
    this.hwIdealForm.disable();
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
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
    this.hwIdealForm.enable();
  }
}
