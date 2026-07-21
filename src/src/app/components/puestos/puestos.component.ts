import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';
import { Puesto } from '../../models/models';
import { PermisoDirective } from '../../directives/permiso.directive';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-puestos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PermisoDirective,
  ],
  template: `
    <main class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <!-- Heading -->
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-secondary">
          Gestión de Puestos
        </h2>
        <p
          class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1"
        >
          Administre la jerarquía organizacional definiendo códigos, nombres y
          responsabilidades detalladas para cada posición operativa y
          administrativa.
        </p>
      </div>
      <div class="grid grid-cols-12 gap-gutter">
        <div class="col-span-12 space-y-gutter">
          <!-- Registration Card -->
          <section class="ucc-card">
            <div class="flex items-center gap-2 mb-6 text-secondary">
              <span class="material-symbols-outlined" data-icon="add_circle"
                >add_circle</span
              >
              <h3 class="font-title-lg text-title-lg">
                {{
                  isReadOnly
                    ? 'Detalles del Puesto'
                    : isEditing
                      ? 'Editar Puesto'
                      : 'Registrar Nuevo Puesto'
                }}
              </h3>
            </div>
            <form
              [formGroup]="puestoForm"
              (ngSubmit)="onSubmit()"
              class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div class="space-y-2">
                <label
                  class="font-label-md text-label-md text-on-surface-variant block"
                  >CÓDIGO</label
                >
                <input
                  formControlName="codigoPuesto"
                  class="ucc-input"
                  placeholder="Ej: OPS-001"
                  type="text"
                />
                @if (
                  puestoForm.get('codigoPuesto')?.invalid &&
                  puestoForm.get('codigoPuesto')?.touched
                ) {
                  <span class="text-error text-xs mt-1 block">Requerido.</span>
                }
              </div>
              <div class="space-y-2">
                <label
                  class="font-label-md text-label-md text-on-surface-variant block"
                  >NOMBRE DEL PUESTO</label
                >
                <input
                  formControlName="nombrePuesto"
                  class="ucc-input"
                  placeholder="Nombre descriptivo"
                  type="text"
                />
                @if (
                  puestoForm.get('nombrePuesto')?.invalid &&
                  puestoForm.get('nombrePuesto')?.touched
                ) {
                  <span class="text-error text-xs mt-1 block">Requerido.</span>
                }
              </div>
              <div class="space-y-2">
                <label
                  class="font-label-md text-label-md text-on-surface-variant block"
                  >DESCRIPCIÓN</label
                >
                <input
                  formControlName="descripcion"
                  class="ucc-input"
                  placeholder="Breve resumen..."
                  type="text"
                />
              </div>
              <div class="flex flex-col items-center h-full pt-4 md:pt-0 gap-2">
                @if (
                  !isReadOnly &&
                  ((!isEditing &&
                    permissionService.tienePermiso('PUESTOS', 'CREAR')) ||
                    (isEditing &&
                      permissionService.tienePermiso('PUESTOS', 'EDITAR')))
                ) {
                  <button
                    type="submit"
                    [disabled]="puestoForm.invalid"
                    class="w-full ucc-btn-primary"
                  >
                    @if (isEditing) {
                      <span class="material-symbols-outlined" data-icon="save"
                        >save</span
                      >
                      Actualizar Puesto
                    } @else {
                      <span class="material-symbols-outlined" data-icon="add"
                        >add</span
                      >
                      Agregar Puesto
                    }
                  </button>
                }
                @if (isEditing || isReadOnly) {
                  <button
                    type="button"
                    (click)="resetForm()"
                    class="ucc-btn-secondary w-full"
                  >
                    {{ isReadOnly ? 'Volver' : 'Cancelar' }}
                  </button>
                }
              </div>
            </form>
          </section>

          <!-- TABLA CON FILTROS TIPO COMBOBOX BUSCABLE -->
          <section class="ucc-table-container">
            <div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/20 bg-ucc-secondary" style="background-color: #356575;">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span class="material-symbols-outlined">work</span> Puestos Registrados
              </h3>
            </div>

            <div class="overflow-x-auto">
              <table class="ucc-table">
                <thead>
                  <tr>
                    <th class="py-4 px-6 font-label-md text-label-md tracking-wider">ID</th>
                    <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Código Puesto</th>
                    <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Nombre</th>
                    <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Descripción</th>
                    <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center w-32">Acciones</th>
                  </tr>

                  <!-- FILA DE FILTROS TIPO COMBOBOX BUSCABLE AMPLIOS Y ESTILIZADOS -->
                  <tr class="bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20">
                    <td class="p-3"></td> <!-- ID sin filtro -->
                    
                    <!-- Código Puesto -->
                    <td class="p-3 relative">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-ucc-neutral-variant text-[18px]">filter_list</span>
                        <input type="text" [(ngModel)]="filtros['codigoPuesto']" (input)="aplicarFiltros()" (focus)="showFiltroCod = true" (blur)="cerrarFiltroCod()" placeholder="Buscar código..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                      </div>
                      @if (showFiltroCod) {
                        <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                          <li (mousedown)="seleccionarFiltro('codigoPuesto', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                          @for (c of codigosFiltradosTabla; track c) {
                            <li (mousedown)="seleccionarFiltro('codigoPuesto', c)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ c }}</li>
                          }
                        </ul>
                      }
                    </td>

                    <!-- Nombre Puesto -->
                    <td class="p-3 relative">
                      <input type="text" [(ngModel)]="filtros['nombrePuesto']" (input)="aplicarFiltros()" (focus)="showFiltroNom = true" (blur)="cerrarFiltroNom()" placeholder="Buscar nombre..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                      @if (showFiltroNom) {
                        <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                          <li (mousedown)="seleccionarFiltro('nombrePuesto', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                          @for (n of nombresFiltradosTabla; track n) {
                            <li (mousedown)="seleccionarFiltro('nombrePuesto', n)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ n }}</li>
                          }
                        </ul>
                      }
                    </td>

                    <!-- Descripción -->
                    <td class="p-3 relative">
                      <input type="text" [(ngModel)]="filtros['descripcion']" (input)="aplicarFiltros()" (focus)="showFiltroDesc = true" (blur)="cerrarFiltroDesc()" placeholder="Buscar descripción..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                      @if (showFiltroDesc) {
                        <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                          <li (mousedown)="seleccionarFiltro('descripcion', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                          @for (d of descripcionesFiltradasTabla; track d) {
                            <li (mousedown)="seleccionarFiltro('descripcion', d)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ d }}</li>
                          }
                        </ul>
                      }
                    </td>

                    <td class="p-3 text-center">
                      <div class="flex justify-center">
                        <div class="flex flex-col gap-1">
                          <button (click)="exportarReporte()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                            <span class="material-symbols-outlined text-[16px]">download</span> Exportar
                          </button>
                          <button (click)="limpiarFiltros()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                            <span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  @for (puesto of paginatedList; track puesto.id) {
                    <tr>
                      <td class="py-4 px-6 font-code text-code text-on-surface-variant">
                        {{ puesto.id }}
                      </td>
                      <td class="py-4 px-6 font-body-md text-body-md font-bold">
                        {{ puesto.codigoPuesto }}
                      </td>
                      <td class="py-4 px-6 font-body-md text-body-md">
                        {{ puesto.nombrePuesto }}
                      </td>
                      <td class="py-4 px-6 font-body-md text-body-md text-on-surface-variant truncate max-w-xs">
                        {{ puesto.descripcion || 'N/A' }}
                      </td>
                      <td class="py-4 px-6">
                        <div class="flex justify-center gap-3">
                          <button
                            (click)="verDetalle(puesto)"
                            class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all"
                            title="Ver Detalles"
                          >
                            <span class="material-symbols-outlined" data-icon="visibility">visibility</span>
                          </button>
                          @if (permissionService.tienePermiso('PUESTOS', 'EDITAR')) {
                            <button
                              (click)="edit(puesto)"
                              class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all"
                              title="Editar"
                            >
                              <span class="material-symbols-outlined" data-icon="edit">edit</span>
                            </button>
                          }
                          @if (permissionService.tienePermiso('PUESTOS', 'ELIMINAR')) {
                            <button
                              (click)="delete(puesto.id)"
                              class="p-2 text-error hover:bg-error/10 rounded-full transition-all"
                              title="Eliminar"
                            >
                              <span class="material-symbols-outlined" data-icon="delete">delete</span>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-8 px-6 text-center font-body-md text-on-surface-variant">
                        No hay puestos registrados en el sistema.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- FOOTER PAGINACIÓN -->
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

          <!-- Resumen y Cards inferiores -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-8">
            <div class="bg-surface-container-low p-8 rounded-xl card-shadow border border-outline-variant/20">
              <h3 class="font-title-lg text-title-lg text-secondary mb-6">Resumen de Puestos</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-6 bg-secondary-container/20 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-secondary/10 rounded-lg text-secondary">
                      <span class="material-symbols-outlined">assessment</span>
                    </div>
                    <span class="font-body-md text-body-md text-secondary font-bold">Total Puestos</span>
                  </div>
                  <span class="font-headline-md text-headline-md text-secondary">{{ puestos.length }}</span>
                </div>
                <div class="flex items-center justify-between p-6 bg-primary-container/10 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary-container/10 rounded-lg text-primary">
                      <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <span class="font-body-md text-body-md text-primary font-bold">Puestos Activos</span>
                  </div>
                  <span class="font-headline-md text-headline-md text-primary">{{ puestos.length }}</span>
                </div>
              </div>
              <button class="w-full mt-6 py-2 text-center text-secondary font-bold font-label-md text-label-md border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-all">
                Ver Reporte Detallado
              </button>
            </div>
            
            <div class="bg-surface-container-low p-md rounded-xl card-shadow border border-outline-variant/20">
              <h3 class="font-title-lg text-title-lg text-secondary mb-6">Cambios Recientes</h3>
              <div class="space-y-6">
                <div class="flex gap-4">
                  <div class="relative">
                    <div class="w-8 h-8 bg-primary-container/20 rounded-full flex items-center justify-center text-primary-container">
                      <span class="material-symbols-outlined text-[18px]">add</span>
                    </div>
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
            
            <div class="bg-secondary p-6 rounded-xl text-on-secondary relative overflow-hidden flex flex-col justify-center">
              <div class="absolute -right-4 -bottom-4 opacity-10">
                <span class="material-symbols-outlined text-[120px]">lightbulb</span>
              </div>
              <h4 class="font-label-md text-label-md font-bold mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">info</span>Tip de Administración
              </h4>
              <p class="text-xs leading-relaxed text-on-secondary/80">
                Mantener los códigos de puesto estandarizados (Ej: DEPT-NUM)
                facilita la integración con el sistema de nómina y la asignación
                de hardware.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class PuestosComponent implements OnInit {
  puestos: Puesto[] = [];
  listaFiltradaTabla: any[] = [];
  puestoForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;
  Math = Math;

  showFiltroCod = false;
  showFiltroNom = false;
  showFiltroDesc = false;

  filtros: { [key: string]: any } = {
    codigoPuesto: '',
    nombrePuesto: '',
    descripcion: '',
  };

  get codigosUnicos(): string[] {
    return Array.from(new Set(this.puestos.map(p => p.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get nombresUnicos(): string[] {
    return Array.from(new Set(this.puestos.map(p => p.nombrePuesto).filter((n): n is string => Boolean(n)))).sort();
  }

  get descripcionesUnicas(): string[] {
    return Array.from(new Set(this.puestos.map(p => p.descripcion).filter((d): d is string => Boolean(d)))).sort();
  }

  get codigosFiltradosTabla() {
    return this.codigosUnicos.filter(c => c.toLowerCase().includes((this.filtros['codigoPuesto'] || '').toLowerCase()));
  }

  get nombresFiltradosTabla() {
    return this.nombresUnicos.filter(n => n.toLowerCase().includes((this.filtros['nombrePuesto'] || '').toLowerCase()));
  }

  get descripcionesFiltradasTabla() {
    return this.descripcionesUnicas.filter(d => d.toLowerCase().includes((this.filtros['descripcion'] || '').toLowerCase()));
  }

  seleccionarFiltro(key: string, val: string) {
    this.filtros[key] = val;
    this.showFiltroCod = false;
    this.showFiltroNom = false;
    this.showFiltroDesc = false;
    this.aplicarFiltros();
  }

  cerrarFiltroCod() { setTimeout(() => this.showFiltroCod = false, 200); }
  cerrarFiltroNom() { setTimeout(() => this.showFiltroNom = false, 200); }
  cerrarFiltroDesc() { setTimeout(() => this.showFiltroDesc = false, 200); }

  aplicarFiltros() {
    this.listaFiltradaTabla = this.puestos.filter((item: any) => {
      let matches = true;
      for (const key in this.filtros) {
        if (this.filtros[key]) {
          if (
            !item[key] ||
            !item[key]
              .toString()
              .toLowerCase()
              .includes(this.filtros[key].toString().toLowerCase())
          ) {
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
    this.currentPage = 1;
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

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const puestosData = this.listaFiltradaTabla.map((row: any) => ({
      ID: row.id,
      'CÓDIGO PUESTO': row.codigoPuesto,
      'NOMBRE PUESTO': row.nombrePuesto,
      DESCRIPCIÓN: row.descripcion || 'N/A',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(puestosData);
    ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 40 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Puestos');
    XLSX.writeFile(wb, `Reporte_Puestos.xlsx`);
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.currentPage = 1;
  }

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    public permissionService: PermissionService,
  ) {
    this.puestoForm = this.fb.group({
      codigoPuesto: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPuestos().subscribe({
      next: (data) => {
        this.puestos = data;
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error cargando puestos', err),
    });
  }

  onSubmit() {
    if (
      this.isEditing &&
      !this.permissionService.tienePermiso('PUESTOS', 'EDITAR')
    ) {
      alert('Acceso denegado: No tienes permiso para editar puestos.');
      return;
    }
    if (
      !this.isEditing &&
      !this.permissionService.tienePermiso('PUESTOS', 'CREAR')
    ) {
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
        error: (err) => alert('No se pudo actualizar el puesto.'),
      });
    } else {
      this.api.createPuesto(this.puestoForm.value).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('No se pudo crear el puesto.'),
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
        error: (err) => alert('No se pudo eliminar el puesto.'),
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