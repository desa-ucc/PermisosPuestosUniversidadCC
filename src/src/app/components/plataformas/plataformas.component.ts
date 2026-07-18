import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import { Plataforma, Empleado, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-plataformas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Plataformas y Licencias</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Plataforma' : (isEditing ? 'Editar Plataforma' : 'Registrar Plataforma') }}</h3></div>
<form [formGroup]="plataformaForm" (ngSubmit)="onSubmit()" >
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
                    (mousedown)="seleccionarEmpleado(null)">Ninguno</li>
                @for(emp of empleadosFiltrados; track emp.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarEmpleado(emp)">{{emp.nombreCompleto}}</li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            @if(plataformaForm.get('empleadoId')?.invalid && plataformaForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
            }
            <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar licencia..."
                     [(ngModel)]="searchTermLicencias"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownLicencias = true"
                     (blur)="cerrarDropdownLicencias()"
                     [disabled]="isReadOnly">
              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownLicencias || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarLicencia(null)">Ninguno</li>
                @for(lic of licenciasFiltrados; track lic.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarLicencia(lic)">{{lic.nombre}}</li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            @if(plataformaForm.get('licencias')?.invalid && plataformaForm.get('licencias')?.touched) {
              <span class="text-red-400 text-xs mt-1">La licencia es requerida.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Seleccione Opción</label>
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar plataforma..."
                     [(ngModel)]="searchTermPlataformas"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownPlataformas = true"
                     (blur)="cerrarDropdownPlataformas()"
                     [disabled]="isReadOnly">
              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownPlataformas || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarPlataforma(null)">Ninguno</li>
                @for(plat of plataformasNombresFiltrados; track plat.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarPlataforma(plat)">{{plat.nombre}}</li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
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
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar nivel..."
                     [(ngModel)]="searchTermNiveles"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownNiveles = true"
                     (blur)="cerrarDropdownNiveles()"
                     [disabled]="isReadOnly">
              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownNiveles || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarNivel(null)">Ninguno</li>
                @for(nivel of nivelesFiltrados; track nivel.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarNivel(nivel)">{{nivel.nombre}}</li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            @if(plataformaForm.get('nivelAcceso')?.invalid && plataformaForm.get('nivelAcceso')?.touched) {
              <span class="text-red-400 text-xs mt-1">El nivel de acceso es requerido.</span>
            }
          </div>
        </div>

        <div class="mt-4">
          @if(!isReadOnly) {
  <button *appPermiso="{pantalla: 'PLATAFORMAS', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="plataformaForm.invalid" class="ucc-btn-primary">
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
<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-2 text-ucc-secondary">
    <span class="material-symbols-outlined">table</span>
    <h3 class="text-xl font-bold">Registros Actuales</h3>
  </div>
</div>

<app-base-filter-bar
      [config]="filterConfig"
      [initialFilters]="filtros"
      [showExportButton]="true"
      (exportData)="exportarReporte()"
      (filtersChanged)="onFiltersChanged($event)"
      (filtersCleared)="limpiarFiltros()">
    </app-base-filter-bar>

<div class="overflow-x-auto">
<table class="ucc-table">
          <thead>
            <tr>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Código Puesto</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Persona</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Puesto</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Licencia</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Plataforma</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Módulos</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Accesos</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Nivel</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Acciones</th>
            </tr>
          </thead>
        <tbody>
          @for(p of paginatedList; track p.id) {
            <tr>
              <td class="py-4 px-6 font-body-md text-body-md font-bold">{{ p.codigoPuesto }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ getEmpleadoName(p.empleadoId) }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ p.nombrePuesto }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">
                <span class="px-2 py-1 rounded text-xs font-semibold"
                      [ngClass]="{
                        'bg-green-800 text-green-200': p.licencias === 'Posee',
                        'bg-gray-600 text-gray-300': p.licencias !== 'Posee'
                      }">
                  {{ p.licencias }}
                </span>
              </td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ p.nombrePlataforma }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ p.modulos }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ p.accesosPermisos }}</td>
              <td class="py-4 px-6 font-body-md text-body-md">{{ p.nivelAcceso }}</td>
              <td class="py-4 px-6">
                <div class="flex justify-center gap-3">
                  <button (click)="verDetalle(p)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                  <button *appPermiso="{pantalla: 'PLATAFORMAS', accion: 'EDITAR'}" (click)="edit(p)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button *appPermiso="{pantalla: 'PLATAFORMAS', accion: 'ELIMINAR'}" (click)="delete(p.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="9" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                No hay plataformas registradas en el sistema.
              </td>
            </tr>
          }
        </tbody>

        </table>

</div>
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
export class PlataformasComponent implements OnInit {
  listaFiltradaTabla: any[] = [];

aplicarFiltros() {
  // Fuerza a usar siempre listaPlataformas en lugar de intentar adivinar con Object.keys
  const dataList = this.listaPlataformas; 

  if (!dataList || dataList.length === 0) {
    this.listaFiltradaTabla = [];
    return;
  }

  this.listaFiltradaTabla = dataList.filter((item: any) => {
    let matches = true;
    for (const key in this.filtros) {
      if (this.filtros[key]) {
        // Obtenemos el valor del filtro y el valor del item
        const valorFiltro = this.filtros[key].toString().toLowerCase();
        const valorItem = (item[key] || '').toString().toLowerCase();
        
        if (!valorItem.includes(valorFiltro)) {
          matches = false;
          break;
        }
      }
    }
    return matches;
  });

  if (this.currentPage > this.totalPages) this.currentPage = 1;
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
      { field: 'nombrePlataforma', placeholder: 'Plataforma', type: 'select', options: this.plataformasNombres, optionValueKey: 'nombre', optionLabelKey: 'nombre' },
      { field: 'licencias', placeholder: 'Licencia', type: 'select', options: this.tiposLicencia, optionValueKey: 'nombre', optionLabelKey: 'nombre' },
      { field: 'modulos', placeholder: 'Módulos', type: 'text' },
      { field: 'accesosPermisos', placeholder: 'Accesos', type: 'text' },
      { field: 'nivelAcceso', placeholder: 'Nivel', type: 'select', options: this.nivelesAcceso, optionValueKey: 'nombre', optionLabelKey: 'nombre' }
    ];
  }

  // Filtros de Tabla
  filtroCodigoPuesto: string = '';
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroLicencia: string = '';
  filtroPlataforma: string = '';
  filtroModulos: string = '';
  filtroAccesos: string = '';
  filtroNivel: string = '';




  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      'PERSONA': this.getEmpleadoName(row.empleadoId) || 'N/A',
      'PUESTO': row.nombrePuesto || 'N/A',
      'LICENCIA': row.licencias || 'N/A',
      'PLATAFORMA': row.nombrePlataforma || 'N/A',
      'MÓDULOS': row.modulos || 'N/A',
      'ACCESOS/PERMISOS': row.accesosPermisos || 'N/A',
      'NIVEL DE ACCESO': row.nivelAcceso || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 35}, {wch: 15}, {wch: 25}, {wch: 25}, {wch: 25}, {wch: 20}];
    XLSX.utils.book_append_sheet(wb, ws, 'Plataformas');
    XLSX.writeFile(wb, `Reporte_Plataformas.xlsx`);
  }

  limpiarFiltros() {
    this.filtroCodigoPuesto = '';
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroLicencia = '';
    this.filtroPlataforma = '';
    this.filtroModulos = '';
    this.filtroAccesos = '';
    this.filtroNivel = '';
    this.currentPage = 1;
  }

  listaPlataformas: Plataforma[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  plataformaForm: FormGroup;
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
        this.plataformaForm.patchValue({ empleadoId: empleado.id });
        this.searchTermEmpleados = empleado.nombreCompleto;
    } else {
        this.plataformaForm.patchValue({ empleadoId: null });
        this.searchTermEmpleados = '';
    }
    this.showDropdownEmpleados = false;
    this.onEmpleadoChange(null);
  }

  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.plataformaForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEmpleados = '';
      } else {
          const matched = this.empleados.find(e => e.id === currentId);
          if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }

  // Buscador Autocompletado: Tipo Licencia
  showDropdownLicencias = false;
  searchTermLicencias = '';

  get licenciasFiltrados() {
    return this.tiposLicencia.filter(l => l.nombre.toLowerCase().includes(this.searchTermLicencias.toLowerCase()));
  }

  seleccionarLicencia(licencia: Catalogo | null) {
    if (licencia) {
        this.plataformaForm.patchValue({ licencias: licencia.nombre });
        this.searchTermLicencias = licencia.nombre;
    } else {
        this.plataformaForm.patchValue({ licencias: null });
        this.searchTermLicencias = '';
    }
    this.showDropdownLicencias = false;
  }

  cerrarDropdownLicencias() {
    setTimeout(() => {
      this.showDropdownLicencias = false;
      const currentId = this.plataformaForm.get('licencias')?.value;
      if (!currentId) {
          this.searchTermLicencias = '';
      } else {
          const matched = this.tiposLicencia.find(l => l.nombre === currentId);
          if (matched) this.searchTermLicencias = matched.nombre;
      }
    }, 200);
  }

  // Buscador Autocompletado: Plataforma
  showDropdownPlataformas = false;
  searchTermPlataformas = '';

  get plataformasNombresFiltrados() {
    return this.plataformasNombres.filter(p => p.nombre.toLowerCase().includes(this.searchTermPlataformas.toLowerCase()));
  }

  seleccionarPlataforma(plataforma: Catalogo | null) {
    if (plataforma) {
        this.plataformaForm.patchValue({ nombrePlataforma: plataforma.nombre });
        this.searchTermPlataformas = plataforma.nombre;
    } else {
        this.plataformaForm.patchValue({ nombrePlataforma: null });
        this.searchTermPlataformas = '';
    }
    this.showDropdownPlataformas = false;
  }

  cerrarDropdownPlataformas() {
    setTimeout(() => {
      this.showDropdownPlataformas = false;
      const currentId = this.plataformaForm.get('nombrePlataforma')?.value;
      if (!currentId) {
          this.searchTermPlataformas = '';
      } else {
          const matched = this.plataformasNombres.find(p => p.nombre === currentId);
          if (matched) this.searchTermPlataformas = matched.nombre;
      }
    }, 200);
  }

  // Buscador Autocompletado: Nivel Acceso
  showDropdownNiveles = false;
  searchTermNiveles = '';

  get nivelesFiltrados() {
    return this.nivelesAcceso.filter(n => n.nombre.toLowerCase().includes(this.searchTermNiveles.toLowerCase()));
  }

  seleccionarNivel(nivel: Catalogo | null) {
    if (nivel) {
        this.plataformaForm.patchValue({ nivelAcceso: nivel.nombre });
        this.searchTermNiveles = nivel.nombre;
    } else {
        this.plataformaForm.patchValue({ nivelAcceso: null });
        this.searchTermNiveles = '';
    }
    this.showDropdownNiveles = false;
  }

  cerrarDropdownNiveles() {
    setTimeout(() => {
      this.showDropdownNiveles = false;
      const currentId = this.plataformaForm.get('nivelAcceso')?.value;
      if (!currentId) {
          this.searchTermNiveles = '';
      } else {
          const matched = this.nivelesAcceso.find(n => n.nombre === currentId);
          if (matched) this.searchTermNiveles = matched.nombre;
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

  selectedEmpleadoPuestoId: number | undefined | null = null;

  // Catálogos dinámicos
  nivelesAcceso: Catalogo[] = [];
  plataformasNombres: Catalogo[] = [];
  tiposLicencia: Catalogo[] = [];

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.plataformaForm = this.fb.group({
      empleadoId: [null, Validators.required],
      licencias: ['', Validators.required],
      nombrePlataforma: ['', Validators.required],
      modulos: ['', Validators.required],
      accesosPermisos: ['', Validators.required],
      nivelAcceso: ['', Validators.required]
    });
  }

  async ngOnInit() {
  // Cargamos los catálogos base primero
  this.loadCatalogos(); 
  
  // Esperamos a tener los datos de empleados y puestos antes de cargar las plataformas
  // Si tienes métodos como api.getEmpleados() y api.getPuestos(), úsalos aquí
  this.api.getEmpleados().subscribe(res => {
    this.empleados = res;
    this.api.getPuestos().subscribe(p => {
        this.puestos = p;
        this.loadData(); // Cargar plataformas solo después de tener empleados y puestos
    });
  });
}


loadData() {
  this.api.getPlataformas().subscribe({
    next: (res: any[]) => {
      this.listaPlataformas = res.map(item => ({
        id: item.id || item.Id,
        empleadoId: item.empleadoId || item.EmpleadoId,
        codigoPuesto: item.codigoPuesto || item.CodigoPuesto || 'N/A',
        // Asegúrate de usar la propiedad tal cual viene del SP (NombrePuesto)
        nombrePuesto: item.nombrePuesto || item.NombrePuesto || 'N/A', 
        nombrePlataforma: item.nombrePlataforma || item.NombrePlataforma || 'N/A',
        licencias: item.licencias || item.Licencias || 'N/A',
        modulos: item.modulos || item.Modulos || 'N/A',
        accesosPermisos: item.accesosPermisos || item.AccesosPermisos || 'N/A',
        nivelAcceso: item.nivelAcceso || item.NivelAcceso || 'N/A'
      }));
      
      this.listaFiltradaTabla = [...this.listaPlataformas];
      this.aplicarFiltros();
    }
  });
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
    if (this.isEditing && !this.permissionService.tienePermiso('PLATAFORMAS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('PLATAFORMAS', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
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
    if (!this.permissionService.tienePermiso('PLATAFORMAS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = plat.id;
    this.plataformaForm.enable();
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso
    });
    this.onEmpleadoChange(null);
    if (plat.empleadoId) {
        const matched = this.empleados.find(e => e.id === plat.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('PLATAFORMAS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.api.deletePlataforma(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(plat: Plataforma) {
    this.isReadOnly = true;
    this.isEditing = false;
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
    this.plataformaForm.disable();
    if (plat.empleadoId) {
        const matched = this.empleados.find(e => e.id === plat.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
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
    this.plataformaForm.enable();
  }
}
