import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ReportePerfil } from '../../models/models';
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
          Consulte la vista consolidada de inventario, software y accesos buscando por Código de Puesto (Perfil Tecnológico).
        </p>
      </div>

      <section class="ucc-card">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">search</span>
          <h3 class="text-xl font-bold">Filtro de Reporte</h3>
        </div>

        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="ucc-label">Código de Perfil (Puesto)</label>
            <input [(ngModel)]="codigoBusqueda" (keyup.enter)="buscar()" class="ucc-input" placeholder="Ej: IT-112 o ADM-010" type="text" />
          </div>
          <button (click)="buscar()" [disabled]="!codigoBusqueda || isLoading" class="ucc-btn-primary md:w-auto w-full h-[50px]">
             @if (isLoading) {
                <span class="material-symbols-outlined animate-spin">sync</span> Buscando...
             } @else {
                <span class="material-symbols-outlined">analytics</span> Generar Reporte
             }
          </button>
        </div>
      </section>

      @if (reporteData.length > 0) {
        <section class="ucc-table-container">
          <div class="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ucc-neutral-outline/20 bg-ucc-secondary">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined">receipt_long</span> Resultados Encontrados: {{ reporteData.length }}
            </h3>
            <button (click)="exportarAExcel()" class="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-white font-bold transition-all flex items-center gap-2 border border-white/30">
              <span class="material-symbols-outlined">download</span> Exportar a Excel
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="ucc-table min-w-[1200px]">
              <thead>
                <tr>
                  <th>Código Emp.</th>
                  <th>Empleado</th>
                  <th>Perfil</th>
                  <th>Equipo Físico</th>
                  <th>Placa</th>
                  <th>Software</th>
                  <th>Versión</th>
                  <th>Plataforma</th>
                  <th>Estado Lic.</th>
                  <th class="text-right">Costo HW</th>
                  <th class="text-right">Costo Lic.</th>
                </tr>
              </thead>
              <tbody>
                @for(item of reporteData; track $index) {
                  <tr>
                    <td class="font-bold">{{item.codigoEmpleado}}</td>
                    <td>{{item.empleado}}</td>
                    <td>{{item.perfil}}</td>
                    <td>{{item.equipo}}</td>
                    <td>{{item.placaEquipo}}</td>
                    <td>{{item.software}}</td>
                    <td>{{item.versionSoftware}}</td>
                    <td>{{item.plataforma}}</td>
                    <td>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase"
                            [ngClass]="item.estadoLicencia === 'Posee' ? 'bg-ucc-primary-container/10 text-ucc-primary' : 'bg-ucc-neutral-outline/20 text-ucc-neutral-variant'">
                        {{item.estadoLicencia}}
                      </span>
                    </td>
                    <td class="text-right font-bold text-ucc-secondary">{{item.costoEstimadoHardware | currency:'USD'}}</td>
                    <td class="text-right font-bold text-ucc-secondary">{{item.costoEstimadoLicencias | currency:'USD'}}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else if (busquedaRealizada && reporteData.length === 0) {
        <section class="ucc-card bg-ucc-background flex flex-col items-center justify-center p-12 text-ucc-neutral-variant">
           <span class="material-symbols-outlined text-[64px] mb-4 opacity-50">search_off</span>
           <p class="text-lg font-bold">No se encontraron resultados</p>
           <p class="text-sm text-center max-w-md mt-2">No existen registros vinculados al código de perfil ingresado, o el puesto no tiene asignaciones vigentes.</p>
        </section>
      }
    </div>
  `
})
export class ReportesComponent {
  codigoBusqueda: string = '';
  reporteData: ReportePerfil[] = [];
  isLoading = false;
  busquedaRealizada = false;

  constructor(private api: ApiService) {}

  buscar() {
    if (!this.codigoBusqueda) return;

    this.isLoading = true;
    this.busquedaRealizada = false;

    this.api.getReportePerfil(this.codigoBusqueda.trim()).subscribe({
      next: (res) => {
        this.reporteData = res;
        this.isLoading = false;
        this.busquedaRealizada = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.busquedaRealizada = true;
        alert('Error al consultar la base de datos.');
      }
    });
  }

  exportarAExcel() {
    // 1. Prepare data specifically for Excel, adding dollar signs and strict numbers if necessary
    // We use the exact visible data.
    const ws_name = 'ReportePerfil';

    // We create a clean array of objects to map into the excel
    const excelData = this.reporteData.map(row => ({
      'CÓDIGO EMPLEADO': row.codigoEmpleado,
      'EMPLEADO': row.empleado,
      'PERFIL (PUESTO)': row.perfil,
      'EQUIPO ASIGNADO': row.equipo,
      'PLACA HW': row.placaEquipo,
      'SOFTWARE': row.software,
      'VERSIÓN': row.versionSoftware,
      'PLATAFORMA NUBE': row.plataforma,
      'LICENCIA': row.estadoLicencia,
      'COSTO HW ($)': row.costoEstimadoHardware,
      'COSTO LICENCIAS ($)': row.costoEstimadoLicencias
    }));

    // 2. Generate worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // 3. Format Currency directly on the WorkSheet (Z corresponds to NumberFormat)
    // The keys for Costo HW are the 10th and 11th columns (J and K)
    // In XLSX column indexes are 0-based. A=0, J=9, K=10.
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:K1');
    for(let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Formatear celda J (HW)
        const cell_hw = ws[XLSX.utils.encode_cell({c: 9, r: R})];
        if(cell_hw && cell_hw.t === 'n') {
             cell_hw.z = '"$"#,##0.00';
        }
        // Formatear celda K (Licencias)
        const cell_lic = ws[XLSX.utils.encode_cell({c: 10, r: R})];
        if(cell_lic && cell_lic.t === 'n') {
             cell_lic.z = '"$"#,##0.00';
        }
    }

    // Custom col widths
    ws['!cols'] = [
        {wch: 15}, {wch: 25}, {wch: 20}, {wch: 20}, {wch: 15},
        {wch: 25}, {wch: 15}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 18}
    ];

    // 4. Create workbook and append worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    // 5. Trigger download
    XLSX.writeFile(wb, `Reporte_Perfil_${this.codigoBusqueda}.xlsx`);
  }
}
