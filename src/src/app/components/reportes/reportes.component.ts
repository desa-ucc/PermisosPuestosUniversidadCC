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
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Generación de Reportes Avanzados</h2>

      <div class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="flex flex-col">
            <label class="text-gray-300 mb-1">Filtrar por Puesto</label>
            <select [(ngModel)]="filtroPuesto" (change)="onFilterChange('puesto')" class="p-2 rounded bg-gray-700 text-white">
              <option value="">Todos los puestos</option>
              @for(puesto of listaPuestos; track puesto.id) {
                <option [value]="puesto.nombrePuesto">{{puesto.nombrePuesto}}</option>
              }
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-gray-300 mb-1">Filtrar por Colaborador</label>
            <select [(ngModel)]="filtroEmpleado" (change)="onFilterChange('empleado')" class="p-2 rounded bg-gray-700 text-white">
              <option value="">Todos los colaboradores</option>
              @for(emp of listaEmpleados; track emp.id) {
                <option [value]="emp.nombreCompleto">{{emp.nombreCompleto}}</option>
              }
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-gray-300 mb-1">Búsqueda Libre</label>
            <input [(ngModel)]="terminoBusqueda" (keyup)="onFilterChange('texto')" (keyup.enter)="buscar()" class="p-2 rounded bg-gray-700 text-white" placeholder="O escriba un término..." type="text" />
          </div>
        </div>

        <div class="flex gap-4">
          <button (click)="limpiarFiltros()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Limpiar</button>
          <button (click)="buscar()" [disabled]="!hasAnyFilter || isLoading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">Generar Reporte</button>
        </div>
      </div>

      @if (busquedaRealizada) {
        @if (hasResults) {

          <div class="flex justify-end mb-4">
            <button (click)="exportarAExcel()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Exportar a Excel</button>
          </div>

          <!-- SECTION 1: HARDWARE -->
          <h3 class="text-xl font-bold mt-8 mb-2">Especificaciones de Equipo</h3>
          <div class="overflow-x-auto bg-gray-800 rounded p-4">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-700">
                  <th class="p-2 border border-gray-600">Puesto</th>
                  <th class="p-2 border border-gray-600">Nombre</th>
                  <th class="p-2 border border-gray-600">Equipo</th>
                  <th class="p-2 border border-gray-600">Procesador</th>
                  <th class="p-2 border border-gray-600">Memoria</th>
                </tr>
              </thead>
              <tbody>
                @for(hw of data.hardware; track $index) {
                  <tr class="hover:bg-gray-700">
                    <td class="p-2 border border-gray-600">{{hw.puesto}}</td>
                    <td class="p-2 border border-gray-600">{{hw.nombre}}</td>
                    <td class="p-2 border border-gray-600">{{hw.equipo || 'N/A'}}</td>
                    <td class="p-2 border border-gray-600">{{hw.procesador || 'N/A'}}</td>
                    <td class="p-2 border border-gray-600">{{hw.memoria || 'N/A'}}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="p-2 text-center">No hay resultados.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <!-- SECTION 2: SITIOS -->
          <h3 class="text-xl font-bold mt-8 mb-2">Permisos por Sitio</h3>
          <div class="overflow-x-auto bg-gray-800 rounded p-4">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-700">
                  <th class="p-2 border border-gray-600">Puesto</th>
                  <th class="p-2 border border-gray-600">Nombre</th>
                  <th class="p-2 border border-gray-600">Sitio</th>
                  <th class="p-2 border border-gray-600">Ambiente</th>
                </tr>
              </thead>
              <tbody>
                @for(sit of data.sitios; track $index) {
                  <tr class="hover:bg-gray-700">
                    <td class="p-2 border border-gray-600">{{sit.puesto}}</td>
                    <td class="p-2 border border-gray-600">{{sit.nombre}}</td>
                    <td class="p-2 border border-gray-600">{{sit.sitio || 'N/A'}}</td>
                    <td class="p-2 border border-gray-600">{{sit.ambiente || 'N/A'}}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="p-2 text-center">No hay resultados.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <!-- SECTION 3: PLATAFORMAS -->
          <h3 class="text-xl font-bold mt-8 mb-2">Plataformas y Licencias</h3>
          <div class="overflow-x-auto bg-gray-800 rounded p-4">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-700">
                  <th class="p-2 border border-gray-600">Puesto</th>
                  <th class="p-2 border border-gray-600">Nombre</th>
                  <th class="p-2 border border-gray-600">Licencias</th>
                  <th class="p-2 border border-gray-600">Plataformas</th>
                </tr>
              </thead>
              <tbody>
                @for(plat of data.plataformas; track $index) {
                  <tr class="hover:bg-gray-700">
                    <td class="p-2 border border-gray-600">{{plat.puesto}}</td>
                    <td class="p-2 border border-gray-600">{{plat.nombre}}</td>
                    <td class="p-2 border border-gray-600">{{plat.licencias || 'N/A'}}</td>
                    <td class="p-2 border border-gray-600">{{plat.plataformas || 'N/A'}}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="p-2 text-center">No hay resultados.</td></tr>
                }
              </tbody>
            </table>
          </div>

        } @else {
          <div class="bg-gray-800 p-8 text-center rounded text-gray-400">
             <p>No se encontraron resultados para los filtros seleccionados.</p>
          </div>
        }
      }
    </div>
  `
})
export class ReportesComponent implements OnInit {
  filtroPuesto: string = '';
  filtroEmpleado: string = '';
  terminoBusqueda: string = '';

  listaPuestos: Puesto[] = [];
  listaEmpleados: Empleado[] = [];

  data: ReporteIntegralResponse = { hardware: [], sitios: [], plataformas: [] };
  isLoading = false;
  busquedaRealizada = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPuestos().subscribe(res => this.listaPuestos = res);
    this.api.getEmpleados().subscribe(res => this.listaEmpleados = res);
  }

  get hasAnyFilter(): boolean {
    return !!this.filtroPuesto || !!this.filtroEmpleado || !!this.terminoBusqueda.trim();
  }

  get hasResults(): boolean {
    return this.data.hardware.length > 0 || this.data.sitios.length > 0 || this.data.plataformas.length > 0;
  }

  onFilterChange(source: 'puesto' | 'empleado' | 'texto') {
    if (source === 'texto' && this.terminoBusqueda.trim() !== '') {
      this.filtroPuesto = '';
      this.filtroEmpleado = '';
    }
    else if (source === 'puesto') {
      this.filtroEmpleado = '';
      this.terminoBusqueda = '';
    }
    else if (source === 'empleado') {
      this.filtroPuesto = '';
      this.terminoBusqueda = '';
    }
  }

  limpiarFiltros() {
    this.filtroPuesto = '';
    this.filtroEmpleado = '';
    this.terminoBusqueda = '';
    this.busquedaRealizada = false;
    this.data = { hardware: [], sitios: [], plataformas: [] };
  }

  buscar() {
    if (!this.hasAnyFilter) return;

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

    if (this.data.hardware.length > 0) {
      const hwData = this.data.hardware.map(row => ({
        'PUESTO': row.puesto,
        'NOMBRE': row.nombre,
        'EQUIPO': row.equipo
      }));
      const wsHw: XLSX.WorkSheet = XLSX.utils.json_to_sheet(hwData);
      XLSX.utils.book_append_sheet(wb, wsHw, 'Hardware');
    }
    XLSX.writeFile(wb, `Reporte_Integral.xlsx`);
  }
}
