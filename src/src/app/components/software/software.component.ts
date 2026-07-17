import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SoftwareLocal, HardwareAsignado } from '../../models/models';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Software Local</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Software Local' : (isEditing ? 'Editar Software Local' : 'Registrar Software Local') }}</h3></div>
<form [formGroup]="swForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar equipo..."
                     [(ngModel)]="searchTermEquipos"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownEquipos = true"
                     (blur)="cerrarDropdownEquipos()"
                     [disabled]="isReadOnly">

              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownEquipos || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarEquipo(null)">
                  Ninguno
                </li>
                @for(eq of equiposFiltrados; track eq.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarEquipo(eq)">
                    {{eq.placa}} - {{eq.marcaPC}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            @if(swForm.get('empleadoId')?.invalid && swForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El equipo/empleado es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Nombre Equipo en Red</label>
<input formControlName="equipo" placeholder="Nombre Equipo en Red" class="ucc-input">
            @if(swForm.get('equipo')?.invalid && swForm.get('equipo')?.touched) {
              <span class="text-red-400 text-xs mt-1">El equipo en red es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Grupos AD</label>
<input formControlName="gruposAD" placeholder="Grupos AD" class="ucc-input">
            @if(swForm.get('gruposAD')?.invalid && swForm.get('gruposAD')?.touched) {
              <span class="text-red-400 text-xs mt-1">Los grupos AD son requeridos.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Nombre Software</label>
<input formControlName="nombreSoftware" placeholder="Nombre Software" class="ucc-input">
            @if(swForm.get('nombreSoftware')?.invalid && swForm.get('nombreSoftware')?.touched) {
              <span class="text-red-400 text-xs mt-1">El nombre de software es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Versión</label>
<input formControlName="version" placeholder="Versión" class="ucc-input">
            @if(swForm.get('version')?.invalid && swForm.get('version')?.touched) {
              <span class="text-red-400 text-xs mt-1">La versión es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Fabricante</label>
<input formControlName="fabricante" placeholder="Fabricante" class="ucc-input">
            @if(swForm.get('fabricante')?.invalid && swForm.get('fabricante')?.touched) {
              <span class="text-red-400 text-xs mt-1">El fabricante es requerido.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          @if(!isReadOnly) {
  <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="swForm.invalid" class="ucc-btn-primary">
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
              <th>Código Puesto</th>
              <th>Puesto</th>
              <th>Equipo Asignado</th>
              <th>Software</th>
              <th>Versión</th>
              <th>Fabricante</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>

          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2">
              <input type="text" [(ngModel)]="filtroCodigoPuesto" (input)="aplicarFiltros()" placeholder="Filtrar Cód..." class="...">
            </td>            <td class="p-2"><input type="text" [(ngModel)]="filtroPuesto" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroEquipo" placeholder="Filtrar Equipo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroSoftware" placeholder="Filtrar Software..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroVersion" placeholder="Filtrar Versión..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroFabricante" placeholder="Filtrar Fabricante..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
          </thead>
          <tbody>
            @for(sw of listaFiltradaTabla; track sw.id) {
              <tr>
                <td>{{sw.codigoPuesto}}</td>
                <td>{{sw.nombrePuesto || getPuestoByEmpleadoId(sw.empleadoId)}}</td>
                <td>{{getEquipoPlaca(sw.empleadoId)}}</td>
                <td>{{sw.nombreSoftware || sw.NombreSoftware}}</td> 
                <td>{{sw.version || sw.Version}}</td>
                <td>{{sw.fabricante || sw.Fabricante}}</td>
                <td>
                  <div class="flex justify-center gap-3"><button (click)="verDetalle(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'EDITAR'}" (click)="edit(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'ELIMINAR'}" (click)="delete(sw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button></div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay registros de software local.
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
export class SoftwareComponent implements OnInit {
  empleados: any[] = [];
  puestos: any[] = [];
  listaFiltradaTabla: any[] = [];

  aplicarFiltros() {
  // Si no hay datos, no hacemos nada
  if (!this.softwareList || this.softwareList.length === 0) return;

  this.listaFiltradaTabla = this.softwareList.filter((item: any) => {
    const matchCod = item.codigoPuesto?.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()) ?? true;
    const matchPuesto = item.nombrePuesto?.toLowerCase().includes(this.filtroPuesto.toLowerCase()) ?? true;
    const matchEquipo = item.equipo?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ?? true;
    const matchSoftware = (item.nombreSoftware || item.NombreSoftware)?.toLowerCase().includes(this.filtroSoftware.toLowerCase()) ?? true;
    const matchVersion = (item.version || item.Version)?.toLowerCase().includes(this.filtroVersion.toLowerCase()) ?? true;
    const matchFabricante = (item.fabricante || item.Fabricante)?.toLowerCase().includes(this.filtroFabricante.toLowerCase()) ?? true;

    return matchCod && matchPuesto && matchEquipo && matchSoftware && matchVersion && matchFabricante;
  });

  this.currentPage = 1;
}

  filtros: any = {};
  filterConfig: FilterColumn[] = [];

  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
    this.aplicarFiltros();
  }

  updateFilterConfig() {
    this.filterConfig = [
      { field: 'codigoPuesto', placeholder: 'Código Puesto', type: 'text' },
      { field: 'nombreCompleto', placeholder: 'Persona', type: 'select', options: this.empleados, optionValueKey: 'nombreCompleto', optionLabelKey: 'nombreCompleto' },
      { field: 'nombrePuesto', placeholder: 'Puesto', type: 'select', options: this.puestos, optionValueKey: 'nombrePuesto', optionLabelKey: 'nombrePuesto' },
      { field: 'equipo', placeholder: 'Equipo', type: 'text' },
      { field: 'gruposAD', placeholder: 'Grupos AD', type: 'text' },
      { field: 'nombreSoftware', placeholder: 'Software', type: 'text' },
      { field: 'version', placeholder: 'Versión', type: 'text' },
      { field: 'fabricante', placeholder: 'Fabricante', type: 'text' }
    ];
  }

  // Filtros de Tabla
  filtroCodigoPuesto: string = '';
  filtroPuesto: string = '';
  filtroEquipo: string = '';
  filtroSoftware: string = '';
  filtroVersion: string = '';
  filtroFabricante: string = '';



  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPuesto = '';
    this.filtroEquipo = '';
    this.filtroSoftware = '';
    this.filtroVersion = '';
    this.filtroFabricante = '';
    this.currentPage = 1;
  }

  softwareList: SoftwareLocal[] = [];
  equipos: HardwareAsignado[] = [];
  swForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  // Buscador Autocompletado: Equipos
  showDropdownEquipos = false;
  searchTermEquipos = '';

  get equiposFiltrados() {
    return this.equipos.filter(e => {
        const fullString = `${e.placa} - ${e.marcaPC}`.toLowerCase();
        return fullString.includes(this.searchTermEquipos.toLowerCase());
    });
  }

  seleccionarEquipo(equipo: HardwareAsignado | null) {
    if (equipo) {
        this.swForm.patchValue({ empleadoId: equipo.empleadoId });
        this.searchTermEquipos = `${equipo.placa} - ${equipo.marcaPC}`;
    } else {
        this.swForm.patchValue({ empleadoId: null });
        this.searchTermEquipos = '';
    }
    this.showDropdownEquipos = false;
  }

  cerrarDropdownEquipos() {
    setTimeout(() => {
      this.showDropdownEquipos = false;
      const currentId = this.swForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEquipos = '';
      } else {
          const matched = this.equipos.find(e => e.empleadoId === currentId);
          if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
      }
    }, 200);
  }


  // Paginación Dinámica
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


  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
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
    this.updateFilterConfig();
  }
loadData() {
  console.log('Iniciando carga de datos...');
  
  // 1. Cargar Software
  this.api.getSoftwareLocales().subscribe({
    next: (res: any) => {
      console.log('Respuesta cruda del API (Software):', res);
      
      // Si el API devuelve un objeto con una propiedad de lista, cámbialo a res.data o lo que sea necesario
      // Aquí estamos forzando que sea un array
      this.softwareList = Array.isArray(res) ? res : [];
      
      console.log('Asignando a listaFiltradaTabla, cantidad:', this.softwareList.length);
      this.listaFiltradaTabla = [...this.softwareList];
      
      this.currentPage = 1;
      this.aplicarFiltros();
    },
    error: (err) => console.error('Error fatal al cargar software:', err)
  });

  // 2. Cargar Equipos
  this.api.getHardwareAsignado().subscribe({
    next: (res: any) => {
      console.log('Equipos cargados correctamente:', res);
      this.equipos = res;
    },
    error: (err) => console.error('Error en Hardware:', err)
  });
}

  getPuestoByEmpleadoId(empleadoId: number): string {
    const hw = this.equipos.find(e => e.empleadoId === empleadoId);
    return hw && hw.nombrePuesto ? hw.nombrePuesto : 'N/A';
  }

  getEquipoPlaca(empleadoId: number): string {
    return this.equipos.find(e => e.empleadoId === empleadoId)?.placa || 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
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
    if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sw.id;
    this.swForm.enable();
    this.searchTermEquipos = '';
    this.swForm.patchValue(sw);
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
    } else {
        this.searchTermEquipos = '';
    }
  }

  delete(id: number) {
    if(confirm('¿Está seguro de que desea eliminar este registro de software?')) {
      this.api.deleteSoftwareLocal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(sw: SoftwareLocal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sw.id;
    this.swForm.patchValue(sw);
    this.swForm.disable();
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
    } else {
        this.searchTermEquipos = '';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.swForm.reset({
      empleadoId: null,
      equipo: '',
      gruposAD: '',
      nombreSoftware: '',
      version: '',
      fabricante: ''
    });
    this.swForm.enable();
    this.searchTermEquipos = '';
  }
}
