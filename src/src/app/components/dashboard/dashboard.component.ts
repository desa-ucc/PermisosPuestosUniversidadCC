import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  totalPuestos: number = 0;
  totalColaboradores: number = 0;
  totalSoftware: number = 0;
  totalEquipos: number = 0;
  licenciasActivas: any[] = [];
  licenciasAlertas: any[] = [];

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

    this.api.getDashboardLicencias().subscribe((res: any) => {
      this.licenciasActivas = res.licenciasActivas || res.LicenciasActivas || [];
      this.licenciasAlertas = res.licenciasInactivasOVencidas || res.LicenciasInactivasOVencidas || [];
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

  // Helper Methods para cálculos seguros
  getContratadas(lic: any): number {
    return Number(lic?.cantidadContratada ?? lic?.CantidadContratada ?? 0) || 0;
  }

  getDisponibles(lic: any): number {
    return Number(lic?.disponibles ?? lic?.Disponibles ?? 0) || 0;
  }

  getAsignadas(lic: any): number {
    const contratadas = this.getContratadas(lic);
    const disponibles = this.getDisponibles(lic);
    const asignadas = contratadas - disponibles;
    return isNaN(asignadas) ? 0 : asignadas;
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
