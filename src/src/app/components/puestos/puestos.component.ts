import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';
import { Puesto } from '../../models/models';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';

@Component({
  selector: 'app-puestos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `

<main class="p-gutter max-w-container-max-width mx-auto space-y-8">
<!-- Heading -->
<div class="mb-8">
<h2 class="font-headline-lg text-headline-lg text-secondary">Gestión de Puestos</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
                Administre la jerarquía organizacional definiendo códigos, nombres y responsabilidades detalladas para cada posición operativa y administrativa.
            </p>
</div>
<div class="grid grid-cols-12 gap-gutter">
<!-- Registration & Table Section (Left + Center) -->
<div class="col-span-12 space-y-gutter">
<!-- Registration Card -->
<section class="ucc-card">
<div class="flex items-center gap-2 mb-6 text-secondary">
<span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
<h3 class="font-title-lg text-title-lg">{{ isReadOnly ? 'Detalles del Puesto' : (isEditing ? 'Editar Puesto' : 'Registrar Nuevo Puesto') }}</h3>
</div>
<form [formGroup]="puestoForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">CÓDIGO</label>
<input formControlName="codigoPuesto" class="ucc-input" placeholder="Ej: OPS-001" type="text"/>
@if(puestoForm.get('codigoPuesto')?.invalid && puestoForm.get('codigoPuesto')?.touched) {
  <span class="text-error text-xs mt-1 block">Requerido.</span>
}
</div>
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">NOMBRE DEL PUESTO</label>
<input formControlName="nombrePuesto" class="ucc-input" placeholder="Nombre descriptivo" type="text"/>
@if(puestoForm.get('nombrePuesto')?.invalid && puestoForm.get('nombrePuesto')?.touched) {
  <span class="text-error text-xs mt-1 block">Requerido.</span>
}
</div>
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">DESCRIPCIÓN</label>
<input formControlName="descripcion" class="ucc-input" placeholder="Breve resumen..." type="text"/>
</div>
<div class="flex flex-col items-center h-full pt-4 md:pt-0 gap-2">
@if(!isReadOnly && ((!isEditing && permissionService.tienePermiso('PUESTOS', 'CREAR')) || (isEditing && permissionService.tienePermiso('PUESTOS', 'EDITAR')))) {
  <button type="submit" [disabled]="puestoForm.invalid" class="w-full ucc-btn-primary w-full">
  @if(isEditing) {
      <span class="material-symbols-outlined" data-icon="save">save</span>
      Actualizar Puesto
  } @else {
      <span class="material-symbols-outlined" data-icon="add">add</span>
      Agregar Puesto
  }
  </button>
}
@if(isEditing || isReadOnly) {
  <button type="button" (click)="resetForm()" class="ucc-btn-secondary w-full">
    {{ isReadOnly ? 'Volver' : 'Cancelar' }}
  </button>
}
</div>
</form>
</section>
<!-- Data Table -->
<section class="ucc-table-container">
<!-- Toolbar de Filtros Estándar -->
<app-base-filter-bar
      [config]="filterConfig"
      [initialFilters]="filtros"
      (filtersChanged)="onFiltersChanged($event)"
      (filtersCleared)="limpiarFiltros()">
    </app-base-filter-bar>


<div class="overflow-x-auto">
<table class="ucc-table">
<thead>
<tr>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider">ID</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Código</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Nombre</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Descripción</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Acciones</th>
</tr>
</thead>
<tbody>
@for(puesto of paginatedList; track puesto.id) {
<tr>
<td class="py-4 px-6 font-code text-code text-on-surface-variant">{{puesto.id}}</td>
<td class="py-4 px-6 font-body-md text-body-md font-bold">{{puesto.codigoPuesto}}</td>
<td class="py-4 px-6 font-body-md text-body-md">{{puesto.nombrePuesto}}</td>
<td class="py-4 px-6 font-body-md text-body-md text-on-surface-variant truncate max-w-xs">{{puesto.descripcion || 'N/A'}}</td>
<td class="py-4 px-6">
<div class="flex justify-center gap-3">
<button (click)="verDetalle(puesto)" class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all" title="Ver Detalles">
<span class="material-symbols-outlined" data-icon="visibility">visibility</span>
</button>
@if (permissionService.tienePermiso('PUESTOS', 'EDITAR')) {
<button (click)="edit(puesto)" class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all" title="Editar">
<span class="material-symbols-outlined" data-icon="edit">edit</span>
</button>
}
@if (permissionService.tienePermiso('PUESTOS', 'ELIMINAR')) {
<button (click)="delete(puesto.id)" class="p-2 text-error hover:bg-error/10 rounded-full transition-all" title="Eliminar">
<span class="material-symbols-outlined" data-icon="delete">delete</span>
</button>
}
</div>
</td>
</tr>
} @empty {
<tr>
<td colspan="5" class="py-8 px-6 text-center font-body-md text-on-surface-variant">No hay puestos registrados en el sistema.</td>
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

</div>
<div class="p-4 bg-surface-container-low flex justify-between items-center text-on-surface-variant">
<p class="font-label-md text-label-md">Mostrando {{listaFiltradaTabla.length}} puestos registrados</p>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-highest transition-all disabled:opacity-50" disabled><span class="material-symbols-outlined text-[18px]" data-icon="chevron_left">chevron_left</span></button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-secondary text-on-secondary font-bold text-xs">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-highest transition-all disabled:opacity-50" disabled><span class="material-symbols-outlined text-[18px]" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-8">
<!-- Resumen de Puestos -->
<div class="bg-surface-container-low p-8 rounded-xl card-shadow border border-outline-variant/20">
<h3 class="font-title-lg text-title-lg text-secondary mb-6">Resumen de Puestos</h3>
<div class="space-y-4">
<div class="flex items-center justify-between p-6 bg-secondary-container/20 rounded-lg">
<div class="flex items-center gap-3">
<div class="p-2 bg-secondary/10 rounded-lg text-secondary"><span class="material-symbols-outlined">assessment</span></div>
<span class="font-body-md text-body-md text-secondary font-bold">Total Puestos</span>
</div>
<span class="font-headline-md text-headline-md text-secondary">{{puestos.length}}</span>
</div>
<div class="flex items-center justify-between p-6 bg-primary-container/10 rounded-lg">
<div class="flex items-center gap-3">
<div class="p-2 bg-primary-container/10 rounded-lg text-primary"><span class="material-symbols-outlined">check_circle</span></div>
<span class="font-body-md text-body-md text-primary font-bold">Puestos Activos</span>
</div>
<span class="font-headline-md text-headline-md text-primary">{{puestos.length}}</span>
</div>
</div>
<button class="w-full mt-6 py-2 text-center text-secondary font-bold font-label-md text-label-md border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-all">Ver Reporte Detallado</button>
</div>
<!-- Cambios Recientes -->
<div class="bg-surface-container-low p-md rounded-xl card-shadow border border-outline-variant/20">
<h3 class="font-title-lg text-title-lg text-secondary mb-6">Cambios Recientes</h3>
<div class="space-y-6">
<div class="flex gap-4">
<div class="relative">
<div class="w-8 h-8 bg-primary-container/20 rounded-full flex items-center justify-center text-primary-container"><span class="material-symbols-outlined text-[18px]">add</span></div>
<div class="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-outline-variant/30"></div>
</div>
<div>
<p class="font-label-md text-label-md font-bold">Base de Datos</p>
<p class="text-[11px] text-on-surface-variant">Sincronizado</p>
<p class="text-[10px] text-on-surface-variant/60 mt-1 uppercase">Ahora</p>
</div>
</div>
</div>
</div>
<!-- Contextual Tip -->
<div class="bg-secondary p-6 rounded-xl text-on-secondary relative overflow-hidden flex flex-col justify-center">
<div class="absolute -right-4 -bottom-4 opacity-10">
<span class="material-symbols-outlined text-[120px]">lightbulb</span>
</div>
<h4 class="font-label-md text-label-md font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">info</span>Tip de Administración</h4>
<p class="text-xs leading-relaxed text-on-secondary/80">Mantener los códigos de puesto estandarizados (Ej: DEPT-NUM) facilita la integración con el sistema de nómina y la asignación de hardware.</p>
</div>
</div>
</div>
</div>
</main>

`
})
export class PuestosComponent implements OnInit {
  puestos: Puesto[] = [];
  listaFiltradaTabla: any[] = [];
  puestoForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;
  Math = Math;

  filtros: any = {
    codigoPuesto: '',
    nombrePuesto: '',
    descripcion: ''
  };

  filterConfig: FilterColumn[] = [];

  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
    this.aplicarFiltros();
  }

  updateFilterConfig() {
    this.filterConfig = [
      { field: 'codigoPuesto', placeholder: 'Código Puesto', type: 'text' },
      { field: 'nombrePuesto', placeholder: 'Nombre Puesto', type: 'text' },
      { field: 'descripcion', placeholder: 'Descripción', type: 'text' }
    ];
  }

  aplicarFiltros() {
    this.listaFiltradaTabla = this.puestos.filter((item: any) => {
      let matches = true;
      for (const key in this.filtros) {
        if (this.filtros[key]) {
          if (!item[key] || !item[key].toString().toLowerCase().includes(this.filtros[key].toString().toLowerCase())) {
            matches = false;
            break;
          }
        }
      }
      return matches;
    });
    this.currentPage = 1;
  }

  limpiarFiltros() {
    this.filtros = { codigoPuesto: '', nombrePuesto: '', descripcion: '' };
    this.aplicarFiltros();
  }

  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.currentPage = 1;
  }

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.puestoForm = this.fb.group({
      codigoPuesto: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.updateFilterConfig();
  }

  loadData() {
    this.api.getPuestos().subscribe({
      next: (data) => {
        this.puestos = data;
        this.aplicarFiltros();
        this.updateFilterConfig();
      },
      error: (err) => console.error('Error cargando puestos', err)
    });
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('PUESTOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar puestos.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('PUESTOS', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear puestos.');
      return;
    }

    this.puestoForm.markAllAsTouched();
    if (this.puestoForm.invalid) return;

    if (this.isEditing && this.currentId) {
      this.api.updatePuesto(this.currentId, this.puestoForm.value).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('No se pudo actualizar el puesto.')
      });
    } else {
      this.api.createPuesto(this.puestoForm.value).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('No se pudo crear el puesto.')
      });
    }
  }

  edit(puesto: Puesto) {
    if (!this.permissionService.tienePermiso('PUESTOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar puestos.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = puesto.id;
    this.puestoForm.enable();
    this.puestoForm.patchValue(puesto);
  }

  verDetalle(puesto: Puesto) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = puesto.id;
    this.puestoForm.patchValue(puesto);
    this.puestoForm.disable();
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('PUESTOS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar puestos.');
      return;
    }
    if (confirm('¿Está seguro de que desea eliminar este puesto?')) {
      this.api.deletePuesto(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el puesto.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.puestoForm.reset();
    this.puestoForm.enable();
  }
}
