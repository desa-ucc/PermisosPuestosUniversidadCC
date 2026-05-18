import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800 p-4 rounded-lg shadow h-96">
          <h2 class="text-xl mb-4 text-center">Equipos por Puesto</h2>
          <ngx-charts-pie-chart
            [view]="[400, 300]"
            [results]="puestosData"
            [gradient]="false"
            [labels]="true"
            [doughnut]="true">
          </ngx-charts-pie-chart>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg shadow h-96">
          <h2 class="text-xl mb-4 text-center">Software Instalado</h2>
          <ngx-charts-bar-vertical
            [view]="[400, 300]"
            [results]="softwareData"
            [xAxis]="true"
            [yAxis]="true"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true">
          </ngx-charts-bar-vertical>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  puestosData: any[] = [];
  softwareData: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPuestos().subscribe(puestos => {
      this.puestosData = puestos.map(p => ({ name: p.nombrePuesto, value: Math.floor(Math.random() * 10) + 1 }));
    });

    this.api.getSoftwareLocales().subscribe(sw => {
       const counts: {[key: string]: number} = {};
       sw.forEach(s => {
         counts[s.nombreSoftware] = (counts[s.nombreSoftware] || 0) + 1;
       });
       this.softwareData = Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    });
  }
}
