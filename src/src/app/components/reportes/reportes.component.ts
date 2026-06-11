import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ReporteIntegralResponse, Puesto, Empleado } from '../../models/models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Generación de Reportes Avanzados</h2>
        <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
          Consulte el consolidado de inventario, software y accesos filtrando a través de los catálogos o mediante búsqueda libre.
        </p>
      </div>

      <section class="ucc-card">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">filter_alt</span>
          <h3 class="text-xl font-bold">Panel de Filtros Avanzados</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="flex flex-col">
            <label class="ucc-label">Filtrar por Puesto</label>
            <div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar puesto..."
                     [(ngModel)]="searchTermPuestos"
                     (focus)="showDropdownPuestos = true"
                     (blur)="cerrarDropdownPuestos()">

              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownPuestos">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarPuesto(null)">
                  Todos los puestos
                </li>
                @for(puesto of puestosFiltrados; track puesto.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarPuesto(puesto)">
                    {{puesto.nombrePuesto}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Filtrar por Colaborador</label>
            <div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar colaborador..."
                     [(ngModel)]="searchTermColaboradores"
                     (focus)="showDropdownColaboradores = true"
                     (blur)="cerrarDropdownColaboradores()">

              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownColaboradores">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarColaborador(null)">
                  Todos los colaboradores
                </li>
                @for(emp of colaboradoresFiltrados; track emp.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarColaborador(emp)">
                    {{emp.nombreCompleto}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Búsqueda Libre</label>
            <input [(ngModel)]="terminoBusqueda"  (keyup.enter)="buscar()" class="ucc-input" placeholder="O escriba un término (código, placa...)" type="text" />
          </div>
        </div>

        <div class="flex gap-4 justify-end border-t border-ucc-neutral-outline/20 pt-4">
          <button (click)="limpiarFiltros()" class="ucc-btn-secondary">
            <span class="material-symbols-outlined">clear_all</span> Limpiar Filtros
          </button>
          <button (click)="buscar()" [disabled]="!formularioTieneFiltros() || isLoading" class="ucc-btn-primary">
             @if (isLoading) {
                <span class="material-symbols-outlined animate-spin">sync</span> Buscando...
             } @else {
                <span class="material-symbols-outlined">analytics</span> Generar Reporte
             }
          </button>
        </div>
      </section>

      @if (busquedaRealizada) {
        @if (hasResults) {

          <div class="flex justify-end mb-4">
            <button (click)="exportarAExcel()" class="bg-ucc-primary text-white hover:bg-ucc-primary/90 font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined">download</span> Exportar Consolidado a Excel
            </button>
          </div>

          <!-- SECTION 1: HARDWARE -->
          <section class="ucc-table-container mb-8 border-l-4 border-l-ucc-secondary">
            <div class="p-4 bg-ucc-secondary/5 flex items-center gap-2 border-b border-ucc-neutral-outline/20">
               <span class="material-symbols-outlined text-ucc-secondary">computer</span>
               <h3 class="font-bold text-ucc-secondary">Sección 1: Especificaciones de Equipo</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="ucc-table min-w-[1000px]">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    <th>Nombre</th>
                    <th>Equipo</th>
                    <th>Procesador</th>
                    <th>Memoria</th>
                    <th>Disco</th>
                    <th>Marca PC</th>
                    <th>Teclado Num.</th>
                    <th>Otras Consideraciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for(hw of paginatedHardwareList; track $index) {
                    <tr>
                      <td class="font-bold">{{hw.puesto}}</td>
                      <td>{{hw.nombre}}</td>
                      <td>{{hw.equipo || 'N/A'}}</td>
                      <td>{{hw.procesador || 'N/A'}}</td>
                      <td>{{hw.memoria || 'N/A'}}</td>
                      <td>{{hw.disco || 'N/A'}}</td>
                      <td>{{hw.marcaPC || 'N/A'}}</td>
                      <td>
                        @if(hw.equipo) {
                           {{hw.tecladoNumerico ? 'Sí' : 'No'}}
                        } @else {
                           N/A
                        }
                      </td>
                      <td>{{hw.otrasConsideraciones || 'N/A'}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="9" class="text-center py-8 text-ucc-neutral-variant bg-ucc-surface">No hay resultados de hardware asociados.</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <!-- HARDWARE PAGINATION FOOTER -->
            @if(data.hardware.length > pageSize) {
                <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ucc-neutral-variant">Mostrar:</span>
            <select class="ucc-input py-1 px-2 text-sm w-20" (change)="changePageSize($event)">
              @for(size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{size}}</option>
              }
            </select>
          </div>

                    <span class="text-sm text-ucc-neutral-variant">Mostrando página {{hardwareCurrentPage}} de {{hardwareTotalPages}}</span>
                    <div class="flex gap-2">
                        <button (click)="prevHardwarePage()" [disabled]="hardwareCurrentPage === 1" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Anterior</button>
                        <button (click)="nextHardwarePage()" [disabled]="hardwareCurrentPage === hardwareTotalPages" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Siguiente</button>
                    </div>
                </div>
            }
          </section>

          <!-- SECTION 2: SITIOS -->
          <section class="ucc-table-container mb-8 border-l-4 border-l-ucc-primary-container">
            <div class="p-4 bg-ucc-primary-container/5 flex items-center gap-2 border-b border-ucc-neutral-outline/20">
               <span class="material-symbols-outlined text-ucc-primary-container">location_on</span>
               <h3 class="font-bold text-ucc-primary-container">Sección 2: Permisos por Sitio</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="ucc-table">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    <th>Nombre</th>
                    <th>Sitio</th>
                    <th>Ambiente</th>
                    <th>Grupos Permisos</th>
                  </tr>
                </thead>
                <tbody>
                  @for(sit of paginatedSitiosList; track $index) {
                    <tr>
                      <td class="font-bold">{{sit.puesto}}</td>
                      <td>{{sit.nombre}}</td>
                      <td>{{sit.sitio || 'N/A'}}</td>
                      <td>
                        @if(sit.ambiente) {
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                                  [ngClass]="sit.ambiente === 'Producción' ? 'bg-ucc-primary-container/20 text-ucc-primary-container' : 'bg-ucc-neutral-outline/20 text-ucc-neutral-variant'">
                               {{sit.ambiente}}
                            </span>
                        } @else {
                            N/A
                        }
                      </td>
                      <td>{{sit.gruposPermisos || 'N/A'}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="text-center py-8 text-ucc-neutral-variant bg-ucc-surface">No hay permisos de sitio asociados.</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <!-- SITIOS PAGINATION FOOTER -->
            @if(data.sitios.length > pageSize) {
                <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ucc-neutral-variant">Mostrar:</span>
            <select class="ucc-input py-1 px-2 text-sm w-20" (change)="changePageSize($event)">
              @for(size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{size}}</option>
              }
            </select>
          </div>

                    <span class="text-sm text-ucc-neutral-variant">Mostrando página {{sitiosCurrentPage}} de {{sitiosTotalPages}}</span>
                    <div class="flex gap-2">
                        <button (click)="prevSitiosPage()" [disabled]="sitiosCurrentPage === 1" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Anterior</button>
                        <button (click)="nextSitiosPage()" [disabled]="sitiosCurrentPage === sitiosTotalPages" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Siguiente</button>
                    </div>
                </div>
            }
          </section>

          <!-- SECTION 3: PLATAFORMAS -->
          <section class="ucc-table-container border-l-4 border-l-ucc-primary">
            <div class="p-4 bg-ucc-primary/5 flex items-center gap-2 border-b border-ucc-neutral-outline/20">
               <span class="material-symbols-outlined text-ucc-primary">cloud_done</span>
               <h3 class="font-bold text-ucc-primary">Sección 3: Plataformas y Licencias</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="ucc-table">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    <th>Nombre</th>
                    <th>Licencias</th>
                    <th>Plataformas</th>
                    <th>Módulos</th>
                    <th>Accesos y Permisos</th>
                    <th>Nivel Acceso</th>
                  </tr>
                </thead>
                <tbody>
                  @for(plat of paginatedPlataformasList; track $index) {
                    <tr>
                      <td class="font-bold">{{plat.puesto}}</td>
                      <td>{{plat.nombre}}</td>
                      <td>
                        @if(plat.licencias) {
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase"
                                [ngClass]="plat.licencias === 'Posee' ? 'bg-ucc-primary-container/20 text-ucc-primary' : 'bg-ucc-neutral-outline/20 text-ucc-neutral-variant'">
                              {{plat.licencias}}
                            </span>
                        } @else {
                            N/A
                        }
                      </td>
                      <td>{{plat.plataformas || 'N/A'}}</td>
                      <td>{{plat.modulos || 'N/A'}}</td>
                      <td>{{plat.accesosYPermisos || 'N/A'}}</td>
                      <td>{{plat.nivelAcceso || 'N/A'}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" class="text-center py-8 text-ucc-neutral-variant bg-ucc-surface">No hay plataformas ni licencias asociadas.</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <!-- PLATAFORMAS PAGINATION FOOTER -->
            @if(data.plataformas.length > pageSize) {
                <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ucc-neutral-variant">Mostrar:</span>
            <select class="ucc-input py-1 px-2 text-sm w-20" (change)="changePageSize($event)">
              @for(size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{size}}</option>
              }
            </select>
          </div>

                    <span class="text-sm text-ucc-neutral-variant">Mostrando página {{plataformasCurrentPage}} de {{plataformasTotalPages}}</span>
                    <div class="flex gap-2">
                        <button (click)="prevPlataformasPage()" [disabled]="plataformasCurrentPage === 1" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Anterior</button>
                        <button (click)="nextPlataformasPage()" [disabled]="plataformasCurrentPage === plataformasTotalPages" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface">Siguiente</button>
                    </div>
                </div>
            }
          </section>

        } @else {
          <section class="ucc-card bg-ucc-background flex flex-col items-center justify-center p-12 text-ucc-neutral-variant shadow-none border-dashed border-2">
             <span class="material-symbols-outlined text-[64px] mb-4 opacity-50">search_off</span>
             <p class="text-lg font-bold">No se encontraron resultados</p>
             <p class="text-sm text-center max-w-md mt-2">Los filtros aplicados no arrojaron ninguna coincidencia en las asignaciones de Hardware, Sitios o Plataformas.</p>
          </section>
        }
      }
    </div>
  `
})
export class ReportesComponent implements OnInit {
  // Filtros Avanzados
  filtroPuesto: string = '';
  filtroEmpleado: string = '';
  terminoBusqueda: string = '';

  // Listas de Catálogos para Filtros
  listaPuestos: Puesto[] = [];
  listaEmpleados: Empleado[] = [];

  // Buscador Puestos
  showDropdownPuestos = false;
  searchTermPuestos = '';

  get puestosFiltrados() {
    return this.listaPuestos.filter(p => p.nombrePuesto.toLowerCase().includes(this.searchTermPuestos.toLowerCase()));
  }

  seleccionarPuesto(puesto: Puesto | null) {
    if (puesto) {
        this.filtroPuesto = puesto.nombrePuesto;
        this.searchTermPuestos = puesto.nombrePuesto;
    } else {
        this.filtroPuesto = '';
        this.searchTermPuestos = '';
    }
    this.showDropdownPuestos = false;
  }

  // Buscador Colaboradores
  showDropdownColaboradores = false;
  searchTermColaboradores = '';

  get colaboradoresFiltrados() {
    return this.listaEmpleados.filter(c => c.nombreCompleto.toLowerCase().includes(this.searchTermColaboradores.toLowerCase()));
  }

  seleccionarColaborador(colaborador: Empleado | null) {
    if (colaborador) {
        this.filtroEmpleado = colaborador.nombreCompleto;
        this.searchTermColaboradores = colaborador.nombreCompleto;
    } else {
        this.filtroEmpleado = '';
        this.searchTermColaboradores = '';
    }
    this.showDropdownColaboradores = false;
  }

  cerrarDropdownPuestos() {
    setTimeout(() => {
      this.showDropdownPuestos = false;
      if(this.filtroPuesto === '' && this.searchTermPuestos !== '') {
          this.searchTermPuestos = '';
      }
    }, 200);
  }

  cerrarDropdownColaboradores() {
    setTimeout(() => {
      this.showDropdownColaboradores = false;
      if(this.filtroEmpleado === '' && this.searchTermColaboradores !== '') {
          this.searchTermColaboradores = '';
      }
    }, 200);
  }



  // Datos del Reporte
  data: ReporteIntegralResponse = { hardware: [], sitios: [], plataformas: [] };
  isLoading = false;
  busquedaRealizada = false;

  // Paginación de Tablas
  pageSize: number = 10;


  pageSizeOptions: number[] = [10, 20, 50, 100];

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.hardwareCurrentPage = 1;
    this.sitiosCurrentPage = 1;
    this.plataformasCurrentPage = 1;
  }
hardwareCurrentPage: number = 1;
  sitiosCurrentPage: number = 1;
  plataformasCurrentPage: number = 1;

  get paginatedHardwareList() {
    const startIndex = (this.hardwareCurrentPage - 1) * this.pageSize;
    return this.data.hardware.slice(startIndex, startIndex + this.pageSize);
  }

  get hardwareTotalPages() {
    return Math.ceil(this.data.hardware.length / this.pageSize) || 1;
  }

  nextHardwarePage() {
    if (this.hardwareCurrentPage < this.hardwareTotalPages) {
      this.hardwareCurrentPage++;
    }
  }

  prevHardwarePage() {
    if (this.hardwareCurrentPage > 1) {
      this.hardwareCurrentPage--;
    }
  }

  get paginatedSitiosList() {
    const startIndex = (this.sitiosCurrentPage - 1) * this.pageSize;
    return this.data.sitios.slice(startIndex, startIndex + this.pageSize);
  }

  get sitiosTotalPages() {
    return Math.ceil(this.data.sitios.length / this.pageSize) || 1;
  }

  nextSitiosPage() {
    if (this.sitiosCurrentPage < this.sitiosTotalPages) {
      this.sitiosCurrentPage++;
    }
  }

  prevSitiosPage() {
    if (this.sitiosCurrentPage > 1) {
      this.sitiosCurrentPage--;
    }
  }

  get paginatedPlataformasList() {
    const startIndex = (this.plataformasCurrentPage - 1) * this.pageSize;
    return this.data.plataformas.slice(startIndex, startIndex + this.pageSize);
  }

  get plataformasTotalPages() {
    return Math.ceil(this.data.plataformas.length / this.pageSize) || 1;
  }

  nextPlataformasPage() {
    if (this.plataformasCurrentPage < this.plataformasTotalPages) {
      this.plataformasCurrentPage++;
    }
  }

  prevPlataformasPage() {
    if (this.plataformasCurrentPage > 1) {
      this.plataformasCurrentPage--;
    }
  }


  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPuestos().subscribe(res => this.listaPuestos = res);
    // Explicit call to load employees, ensuring the array is populated
    this.api.getEmpleados().subscribe(res => this.listaEmpleados = res);
  }

  formularioTieneFiltros(): boolean {
    return !!this.filtroPuesto || !!this.filtroEmpleado || !!this.terminoBusqueda.trim();
  }

  get hasResults(): boolean {
    return this.data.hardware.length > 0 || this.data.sitios.length > 0 || this.data.plataformas.length > 0;
  }



  limpiarFiltros() {
    this.filtroPuesto = '';
    this.searchTermPuestos = '';
    this.filtroEmpleado = '';
    this.searchTermColaboradores = '';
    this.terminoBusqueda = '';
    this.busquedaRealizada = false;


    this.data = { hardware: [], sitios: [], plataformas: [] };
  }

  buscar() {
    if (!this.formularioTieneFiltros()) return;

    let parametroFinal = '';
    if (this.terminoBusqueda.trim() !== '') {
      parametroFinal = this.terminoBusqueda.trim();
    } else if (this.filtroEmpleado !== '') {
      parametroFinal = this.filtroEmpleado;
    } else if (this.filtroPuesto !== '') {
      parametroFinal = this.filtroPuesto;
    }

    this.isLoading = true;
    this.busquedaRealizada = false;



    this.api.getReporteIntegral(parametroFinal).subscribe({
      next: (res) => {
        this.data = res;
        this.isLoading = false;
        this.busquedaRealizada = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.busquedaRealizada = true;
        alert('Error al consultar el reporte integral.');
      }
    });
  }

  exportarAExcel() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // 1. Hardware Sheet
    if (this.data.hardware.length > 0) {
      const hwData = this.data.hardware.map(row => ({
        'PUESTO': row.puesto,
        'NOMBRE': row.nombre,
        'EQUIPO': row.equipo,
        'PROCESADOR': row.procesador,
        'MEMORIA': row.memoria,
        'DISCO': row.disco,
        'MARCA PC': row.marcaPC,
        'TECLADO NUM.': row.tecladoNumerico ? 'Sí' : 'No',
        'OTRAS CONSIDERACIONES': row.otrasConsideraciones
      }));
      const wsHw: XLSX.WorkSheet = XLSX.utils.json_to_sheet(hwData);
      wsHw['!cols'] = [{wch: 20}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 30}];
      XLSX.utils.book_append_sheet(wb, wsHw, 'Hardware');
    }

    // 2. Sitios Sheet
    if (this.data.sitios.length > 0) {
      const sitData = this.data.sitios.map(row => ({
        'PUESTO': row.puesto,
        'NOMBRE': row.nombre,
        'SITIO': row.sitio,
        'AMBIENTE': row.ambiente,
        'GRUPOS PERMISOS': row.gruposPermisos
      }));
      const wsSit: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sitData);
      wsSit['!cols'] = [{wch: 20}, {wch: 30}, {wch: 25}, {wch: 15}, {wch: 30}];
      XLSX.utils.book_append_sheet(wb, wsSit, 'Sitios');
    }

    // 3. Plataformas Sheet
    if (this.data.plataformas.length > 0) {
      const platData = this.data.plataformas.map(row => ({
        'PUESTO': row.puesto,
        'NOMBRE': row.nombre,
        'LICENCIAS': row.licencias,
        'PLATAFORMAS': row.plataformas,
        'MODULOS': row.modulos,
        'ACCESOS Y PERMISOS': row.accesosYPermisos,
        'NIVEL ACCESO': row.nivelAcceso
      }));
      const wsPlat: XLSX.WorkSheet = XLSX.utils.json_to_sheet(platData);
      wsPlat['!cols'] = [{wch: 20}, {wch: 30}, {wch: 15}, {wch: 20}, {wch: 25}, {wch: 25}, {wch: 15}];
      XLSX.utils.book_append_sheet(wb, wsPlat, 'Plataformas');
    }

    XLSX.writeFile(wb, `Reporte_Integral.xlsx`);
  }
}
