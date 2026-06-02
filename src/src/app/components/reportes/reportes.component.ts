import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ReporteIntegralResponse } from '../../models/models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Generación de Reportes</h2>
        <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
          Buscador global integral. Consulte el consolidado de inventario, software y accesos filtrando por código, puesto o empleado.
        </p>
      </div>

      <section class="ucc-card">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">search</span>
          <h3 class="text-xl font-bold">Filtro de Búsqueda</h3>
        </div>

        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="ucc-label">Buscar por Código, Puesto o Nombre de Empleado...</label>
            <input [(ngModel)]="terminoBusqueda" (keyup.enter)="buscar()" class="ucc-input" placeholder="Ej: Juan Pérez, ADM-010, Gerente..." type="text" />
          </div>
          <button (click)="buscar()" [disabled]="!terminoBusqueda || isLoading" class="ucc-btn-primary md:w-auto w-full h-[50px]">
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
            <button (click)="exportarAExcel()" class="ucc-btn-secondary text-ucc-secondary">
              <span class="material-symbols-outlined">download</span> Exportar Consolidado a Excel
            </button>
          </div>

          <!-- SECTION 1: HARDWARE -->
          <section class="ucc-card mb-8 p-0 overflow-hidden border-ucc-primary-container/30 border-2">
            <div class="p-4 bg-ucc-primary-container/10 flex items-center gap-2 border-b border-ucc-primary-container/20">
               <span class="material-symbols-outlined text-ucc-primary-container">computer</span>
               <h3 class="font-bold text-ucc-primary">Sección 1: Especificaciones de Equipo</h3>
            </div>
            <div class="overflow-x-auto p-4">
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
                  @for(hw of data.hardware; track $index) {
                    <tr>
                      <td class="font-bold">{{hw.puesto}}</td>
                      <td>{{hw.nombre}}</td>
                      <td>{{hw.equipo}}</td>
                      <td>{{hw.procesador}}</td>
                      <td>{{hw.memoria}}</td>
                      <td>{{hw.disco}}</td>
                      <td>{{hw.marcaPC}}</td>
                      <td>{{hw.tecladoNumerico ? 'Sí' : 'No'}}</td>
                      <td>{{hw.otrasConsideraciones || 'N/A'}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="9" class="text-center py-4">No hay resultados de hardware.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- SECTION 2: SITIOS -->
          <section class="ucc-card mb-8 p-0 overflow-hidden border-ucc-secondary/30 border-2">
            <div class="p-4 bg-ucc-secondary/10 flex items-center gap-2 border-b border-ucc-secondary/20">
               <span class="material-symbols-outlined text-ucc-secondary">location_on</span>
               <h3 class="font-bold text-ucc-secondary">Sección 2: Permisos por Sitio</h3>
            </div>
            <div class="overflow-x-auto p-4">
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
                  @for(sit of data.sitios; track $index) {
                    <tr>
                      <td class="font-bold">{{sit.puesto}}</td>
                      <td>{{sit.nombre}}</td>
                      <td>{{sit.sitio}}</td>
                      <td>{{sit.ambiente}}</td>
                      <td>{{sit.gruposPermisos}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="text-center py-4">No hay resultados de sitios.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- SECTION 3: PLATAFORMAS -->
          <section class="ucc-card p-0 overflow-hidden border-ucc-neutral-outline border-2">
            <div class="p-4 bg-ucc-neutral-outline/10 flex items-center gap-2 border-b border-ucc-neutral-outline/30">
               <span class="material-symbols-outlined text-ucc-neutral-variant">cloud_done</span>
               <h3 class="font-bold text-ucc-neutral-variant">Sección 3: Plataformas y Licencias</h3>
            </div>
            <div class="overflow-x-auto p-4">
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
                  @for(plat of data.plataformas; track $index) {
                    <tr>
                      <td class="font-bold">{{plat.puesto}}</td>
                      <td>{{plat.nombre}}</td>
                      <td>{{plat.licencias}}</td>
                      <td>{{plat.plataformas}}</td>
                      <td>{{plat.modulos}}</td>
                      <td>{{plat.accesosYPermisos}}</td>
                      <td>{{plat.nivelAcceso}}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" class="text-center py-4">No hay resultados de plataformas.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

        } @else {
          <section class="ucc-card bg-ucc-background flex flex-col items-center justify-center p-12 text-ucc-neutral-variant shadow-none border-dashed border-2">
             <span class="material-symbols-outlined text-[64px] mb-4 opacity-50">search_off</span>
             <p class="text-lg font-bold">No se encontraron resultados</p>
             <p class="text-sm text-center max-w-md mt-2">Intente con otro término de búsqueda (código, puesto o empleado).</p>
          </section>
        }
      }
    </div>
  `
})
export class ReportesComponent {
  terminoBusqueda: string = '';
  data: ReporteIntegralResponse = { hardware: [], sitios: [], plataformas: [] };
  isLoading = false;
  busquedaRealizada = false;

  constructor(private api: ApiService) {}

  get hasResults(): boolean {
    return this.data.hardware.length > 0 || this.data.sitios.length > 0 || this.data.plataformas.length > 0;
  }

  buscar() {
    if (!this.terminoBusqueda) return;

    this.isLoading = true;
    this.busquedaRealizada = false;

    this.api.getReporteIntegral(this.terminoBusqueda.trim()).subscribe({
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

    XLSX.writeFile(wb, `Reporte_Integral_${this.terminoBusqueda}.xlsx`);
  }
}
