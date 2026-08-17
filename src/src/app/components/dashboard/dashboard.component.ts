import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
<!-- Dashboard Header -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
  <div>
    <h2 class="font-display-lg text-headline-lg text-secondary">Panel Operativo</h2>
    <p class="text-body-lg font-body-lg text-on-surface-variant">Resumen ejecutivo del cumplimiento y asignaciones de activos.</p>
  </div>
  <button (click)="exportToExcel()" class="bg-primary-container text-on-primary-fixed-variant px-4 py-2 rounded-lg font-label-md text-label-md hover:brightness-110 transition-all flex items-center gap-2">
    <span class="material-symbols-outlined">download</span> Generar Reporte</button>
</div>

<!-- 4 Stat Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
  <div class="ucc-card flex flex-col gap-2 border-l-4 border-secondary hover:-translate-y-1 transition-transform duration-300">
    <div class="flex justify-between items-start">
      <span class="material-symbols-outlined text-secondary bg-secondary-container p-2 rounded-lg">badge</span>
      <span class="text-primary font-bold text-label-md flex items-center bg-primary-fixed/30 px-2 py-0.5 rounded-full">Total</span>
    </div>
    <h3 class="text-on-surface-variant font-label-md text-label-md">Puestos Activos</h3>
    <p class="text-headline-md font-headline-md text-secondary">{{ totalPuestos }}</p>
  </div>

  <div class="ucc-card flex flex-col gap-2 border-l-4 border-primary-container hover:-translate-y-1 transition-transform duration-300">
    <div class="flex justify-between items-start">
      <span class="material-symbols-outlined text-primary-container bg-primary-fixed/30 p-2 rounded-lg">group</span>
      <span class="text-primary font-bold text-label-md flex items-center bg-primary-fixed/30 px-2 py-0.5 rounded-full">Total</span>
    </div>
    <h3 class="text-on-surface-variant font-label-md text-label-md">Colaboradores</h3>
    <p class="text-headline-md font-headline-md text-secondary">{{ totalColaboradores }}</p>
  </div>

  <div class="ucc-card flex flex-col gap-2 border-l-4 border-tertiary-container hover:-translate-y-1 transition-transform duration-300">
    <div class="flex justify-between items-start">
      <span class="material-symbols-outlined text-tertiary-container bg-tertiary-fixed/30 p-2 rounded-lg">terminal</span>
      <span class="text-on-surface-variant text-label-md font-label-md italic">Verificado</span>
    </div>
    <h3 class="text-on-surface-variant font-label-md text-label-md">Software Licenciado</h3>
    <p class="text-headline-md font-headline-md text-secondary">{{ totalSoftware }}</p>
  </div>

  <div class="ucc-card flex flex-col gap-2 border-l-4 hover:-translate-y-1 transition-transform duration-300 border-primary">
    <div class="flex justify-between items-start">
      <span class="material-symbols-outlined p-2 rounded-lg text-primary bg-primary-container" data-weight="fill">verified_user</span>
    </div>
    <h3 class="text-on-surface-variant font-label-md text-label-md">Asignación Equipos</h3>
    <p class="text-headline-md font-headline-md text-secondary">{{ totalEquipos }}</p>
  </div>
</div>

<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
  <!-- Chart: Equipos por Puesto -->
  <div class="col-span-12 lg:col-span-8 ucc-card p-0 flex flex-col">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 px-6 pt-6 gap-4">
      <div>
        <h3 class="font-title-lg text-title-lg text-secondary">Distribución de Hardware por Puesto</h3>
        <p class="text-body-md text-on-surface-variant">Distribución de hardware por jerarquía organizacional.</p>
      </div>

      <!-- Chart Selector -->
      <div class="flex bg-surface-container-low rounded-lg p-1">
        <button (click)="setChartType('pie')" [class.bg-white]="chartType === 'pie'" [class.shadow]="chartType === 'pie'" class="px-3 py-1.5 text-label-md rounded-md transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">pie_chart</span> Pastel
        </button>
        <button (click)="setChartType('bar')" [class.bg-white]="chartType === 'bar'" [class.shadow]="chartType === 'bar'" class="px-3 py-1.5 text-label-md rounded-md transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">bar_chart</span> Barras
        </button>
        <button (click)="setChartType('list')" [class.bg-white]="chartType === 'list'" [class.shadow]="chartType === 'list'" class="px-3 py-1.5 text-label-md rounded-md transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">list</span> Lista
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="flex-1 flex items-center justify-center min-h-[350px] p-4">

      <ng-container *ngIf="chartData.length > 0; else noData">

        <!-- Pie Chart -->
        <div *ngIf="chartType === 'pie'" class="w-full h-[300px]">
          <ngx-charts-pie-chart
            [results]="chartData"
            [scheme]="colorScheme"
            [gradient]="false"
            [legend]="true"
            [legendPosition]="legendPosition"
            [labels]="true"
            [doughnut]="true"
            [arcWidth]="0.35">
          </ngx-charts-pie-chart>
        </div>

        <!-- Bar Chart -->
        <div *ngIf="chartType === 'bar'" class="w-full h-[300px]">
           <ngx-charts-bar-vertical
            [results]="chartData"
            [scheme]="colorScheme"
            [gradient]="false"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            [xAxisLabel]="'Puestos'"
            [yAxisLabel]="'Cantidad de Equipos'">
          </ngx-charts-bar-vertical>
        </div>

        <!-- List View -->
        <div *ngIf="chartType === 'list'" class="w-full overflow-x-auto max-h-[300px] overflow-y-auto pr-2">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-surface-container-highest">
                  <th class="p-3 text-label-lg font-bold text-secondary">Puesto</th>
                  <th class="p-3 text-label-lg font-bold text-secondary text-right">Equipos Asignados</th>
                  <th class="p-3 text-label-lg font-bold text-secondary text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of chartData; let i = index" class="border-b border-surface-container-highest hover:bg-surface-container-low transition-colors">
                  <td class="p-3 text-body-md flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" [style.background-color]="colorScheme.domain[i % colorScheme.domain.length]"></span>
                    {{ item.name }}
                  </td>
                  <td class="p-3 text-body-md text-right font-medium">{{ item.value }}</td>
                  <td class="p-3 text-body-md text-right text-on-surface-variant">{{ (item.value / totalEquipos * 100).toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
        </div>

      </ng-container>

      <ng-template #noData>
        <div class="flex flex-col items-center justify-center text-on-surface-variant p-8">
            <span class="material-symbols-outlined text-[48px] mb-4 opacity-50">analytics</span>
            <p>No hay datos de asignación suficientes para mostrar gráficos.</p>
        </div>
      </ng-template>

    </div>
  </div>

  <!-- Status Indicator: Métricas de Gestión -->
  <div class="col-span-12 lg:col-span-4 bg-ucc-primary-fixed/20 p-md rounded-xl border border-ucc-primary-container flex flex-col justify-between">
    <div>
      <h3 class="font-title-lg text-title-lg text-on-primary-fixed-variant mb-4">Métricas de Gestión</h3>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg shadow-sm">
        <span class="text-label-md text-on-surface-variant">Total Puestos Registrados</span>
        <span class="font-bold text-title-lg text-primary">{{ totalPuestos }}</span>
      </div>
      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg shadow-sm">
        <span class="text-label-md text-on-surface-variant">Colaboradores sin Puesto</span>
        <span class="font-bold text-title-lg text-error">{{ colaboradoresSinPuesto }}</span>
      </div>
      <div class="flex justify-between items-center bg-white/60 p-3 rounded-lg shadow-sm">
        <span class="text-label-md text-on-surface-variant">Colaboradores Multi-Puesto</span>
        <span class="font-bold text-title-lg text-tertiary">{{ colaboradoresMultiPuesto }}</span>
      </div>
    </div>

    <div class="bg-white/60 backdrop-blur p-4 rounded-lg flex items-center gap-4 mt-6">
      <span class="material-symbols-outlined text-primary-container animate-float">info</span>
      <p class="text-label-md text-on-secondary-fixed-variant">
        Datos calculados en tiempo real basados en la plantilla de {{ totalColaboradores }} colaboradores activos.
      </p>
    </div>
  </div>
</div>
`
})
export class DashboardComponent implements OnInit {
  totalPuestos: number = 0;
  totalColaboradores: number = 0;
  totalSoftware: number = 0;
  totalEquipos: number = 0;

  operativosCount: number = 0;
  gerencialesCount: number = 0;
  directivosCount: number = 0;

  colaboradoresSinPuesto: number = 0;
  colaboradoresMultiPuesto: number = 0;

  // Chart data and state
  chartData: any[] = [];
  chartType: 'pie' | 'bar' | 'list' = 'bar';
  legendPosition = LegendPosition.Right;
  colorScheme: any = {
    domain: ['#0A2540', '#635BFF', '#00D4FF', '#FF007F', '#FFD700', '#2E8B57']
  };

  // Keep original data for table view
  rawHardwareData: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.api.getPuestos().subscribe(res => {
      this.totalPuestos = res.length;
      });

    this.api.getEmpleados().subscribe(res => {
      this.totalColaboradores = res.length;
      this.colaboradoresSinPuesto = res.filter(e => !e.puestoId).length;

      const countsByEmpleado = res.reduce((acc, curr) => {
        if (curr.codigoEmpleado) {
          acc[curr.codigoEmpleado] = (acc[curr.codigoEmpleado] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });

      this.colaboradoresMultiPuesto = Object.values(countsByEmpleado).filter(count => count > 1).length;
    });

    this.api.getSoftwareLocales().subscribe(res => {
      this.totalSoftware = res.length;
    });

    this.api.getHardwareAsignado().subscribe(res => {
      this.totalEquipos = res.length;
      this.rawHardwareData = res;
      this.processChartData(res);
      });
  }

  processChartData(hardware: any[]) {
    const countsByPuesto: { [key: string]: number } = {};

    hardware.forEach(item => {
      const puesto = item.nombrePuesto || 'Sin Puesto Asignado';
      countsByPuesto[puesto] = (countsByPuesto[puesto] || 0) + 1;
    });

    this.chartData = Object.keys(countsByPuesto).map(key => ({
      name: key,
      value: countsByPuesto[key]
    })).sort((a, b) => b.value - a.value);

    // Keep some original stats for backwards compatibility in template if needed
    if (this.chartData.length > 0) {
        this.operativosCount = this.chartData[0]?.value || 0;
        this.gerencialesCount = this.chartData.length > 1 ? this.chartData[1]?.value : 0;
        this.directivosCount = this.chartData.length > 2 ? this.chartData[2]?.value : 0;
    }
  }

    setChartType(type: 'pie' | 'bar' | 'list') {
    this.chartType = type;
  }

  exportToExcel() {
    // Summary Data
    const summaryData = [
      { Metrica: 'Total de Puestos', Valor: this.totalPuestos },
      { Metrica: 'Colaboradores Totales', Valor: this.totalColaboradores },
      { Metrica: 'Colaboradores sin Puesto', Valor: this.colaboradoresSinPuesto },
      { Metrica: 'Colaboradores con Múltiples Puestos', Valor: this.colaboradoresMultiPuesto },
      { Metrica: 'Software Licenciado', Valor: this.totalSoftware },
      { Metrica: 'Equipos Físicos Asignados', Valor: this.totalEquipos }
    ];

    // Chart Data
    const distributionData = this.chartData.map(item => ({
      'Puesto': item.name,
      'Cantidad de Equipos': item.value
    }));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const wsSummary: XLSX.WorkSheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

    const wsDistribution: XLSX.WorkSheet = XLSX.utils.json_to_sheet(distributionData);
    XLSX.utils.book_append_sheet(wb, wsDistribution, 'Distribución de Equipos');

    XLSX.writeFile(wb, `Reporte_Dashboard_Operativo.xlsx`);
  }
}
