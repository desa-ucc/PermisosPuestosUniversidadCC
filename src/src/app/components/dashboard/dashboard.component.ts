import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
<!-- Dashboard Header -->
<div class="flex justify-between items-end mb-8">
<div>
<h2 class="font-display-lg text-headline-lg text-secondary">Dashboard Operativo</h2>
<p class="text-body-lg font-body-lg text-on-surface-variant">Resumen ejecutivo del cumplimiento y asignaciones de activos.</p>
</div>
</div>
<!-- 4 Stat Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
<div class="ucc-card flex flex-col gap-2 border-l-4 border-secondary hover:-translate-y-1 transition-transform duration-300">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-secondary bg-secondary-container p-2 rounded-lg">badge</span>
<span class="text-primary font-bold text-label-md flex items-center bg-primary-fixed/30 px-2 py-0.5 rounded-full">+4%</span>
</div>
<h3 class="text-on-surface-variant font-label-md text-label-md">Puestos Activos</h3>
<p class="text-headline-md font-headline-md text-secondary">{{ totalPuestos }}</p>
</div>
<div class="ucc-card flex flex-col gap-2 border-l-4 border-primary-container hover:-translate-y-1 transition-transform duration-300">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-primary-container bg-primary-fixed/30 p-2 rounded-lg">group</span>
<span class="text-primary font-bold text-label-md flex items-center bg-primary-fixed/30 px-2 py-0.5 rounded-full">+12</span>
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
<div class="ucc-card flex flex-col gap-2 border-l-4 border-error hover:-translate-y-1 transition-transform duration-300">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-error bg-error-container p-2 rounded-lg" data-weight="fill">verified_user</span>
<span class="text-error font-bold text-label-md flex items-center bg-error-container/50 px-2 py-0.5 rounded-full">-2%</span>
</div>
<h3 class="text-on-surface-variant font-label-md text-label-md">Puntaje Seguridad</h3>
<p class="text-headline-md font-headline-md text-secondary">94.2%</p>
</div>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-12 gap-gutter">
<!-- Donut Chart: Equipos por Puesto -->
<div class="col-span-12 lg:col-span-8 ucc-card p-0">
<div class="flex justify-between items-center mb-6">
<div>
<h3 class="font-title-lg text-title-lg text-secondary">Equipos por Puesto</h3>
<p class="text-body-md text-on-surface-variant">Distribución de hardware por jerarquía organizacional.</p>
</div>
<button class="material-symbols-outlined text-on-surface-variant">more_vert</button>
</div>
<div class="flex flex-col md:flex-row items-center gap-xl py-4">
<div class="relative w-64 h-64">
<svg class="w-full h-full -rotate-90" viewbox="0 0 36 36">
<path class="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" stroke-width="4"></path>
<path class="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" stroke-dasharray="75, 100" stroke-linecap="round" stroke-width="4"></path>
<path class="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" stroke-dasharray="15, 100" stroke-dashoffset="-75" stroke-linecap="round" stroke-width="4"></path>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-headline-md font-headline-md text-secondary">{{ totalEquipos }}</span>
<span class="text-label-md text-on-surface-variant">Unidades</span>
</div>
</div>
<div class="flex-1 space-y-4 w-full">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-primary-container"></span>
<span class="text-body-md text-on-surface">Operativos</span>
</div>
<span class="font-bold text-secondary">{{ operativosCount }} (75%)</span>
</div>
<div class="w-full bg-surface-container-highest h-2 rounded-full">
<div class="bg-primary-container h-2 rounded-full w-[75%]"></div>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-secondary"></span>
<span class="text-body-md text-on-surface">Gerenciales</span>
</div>
<span class="font-bold text-secondary">{{ gerencialesCount }} (15%)</span>
</div>
<div class="w-full bg-surface-container-highest h-2 rounded-full">
<div class="bg-secondary h-2 rounded-full w-[15%]"></div>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-tertiary-container"></span>
<span class="text-body-md text-on-surface">Directivos</span>
</div>
<span class="font-bold text-secondary">{{ directivosCount }} (10%)</span>
</div>
<div class="w-full bg-surface-container-highest h-2 rounded-full">
<div class="bg-tertiary-container h-2 rounded-full w-[10%]"></div>
</div>
</div>
</div>
</div>
<!-- Status Indicator: Cumplimiento Total -->
<div class="col-span-12 lg:col-span-4 bg-ucc-primary-fixed/20 p-md rounded-xl border border-ucc-primary-container relative overflow-hidden flex flex-col justify-between">
<div class="absolute top-0 right-0 p-4 opacity-10">
<span class="material-symbols-outlined text-[120px]" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<div>
<h3 class="font-title-lg text-title-lg text-on-primary-fixed-variant mb-2">Cumplimiento Total</h3>
<p class="text-body-md text-primary font-medium">Estado General de Infraestructura</p>
</div>
<div class="py-6">
<div class="text-[64px] font-bold text-primary-container leading-none">98.4%</div>
<p class="text-label-md text-primary font-bold uppercase tracking-wider mt-2">Nivel de Confianza: ALTO</p>
</div>
<div class="bg-white/60 backdrop-blur p-4 rounded-lg flex items-center gap-4">
<span class="material-symbols-outlined text-primary-container animate-float">info</span>
<p class="text-label-md text-on-secondary-fixed-variant">Se detectaron 3 dispositivos con software no autorizado fuera del catálogo.</p>
</div>
</div>

</div>
<!-- Recent Activity / Floating Data -->
<!--<div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<div class="lg:col-span-1 ucc-card hover:-translate-y-1 transition-transform duration-300">
<h3 class="font-title-lg text-title-lg text-secondary mb-4">Alertas de Permisos</h3>
<div class="space-y-4">
<div class="flex items-start gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-all cursor-pointer">
<span class="material-symbols-outlined text-error">warning</span>
<div>
<p class="text-body-md font-bold text-on-surface">Software no autorizado</p>
<p class="text-label-md text-on-surface-variant">Usuario: J. Pérez - Adobe Pro</p>
</div>
</div>
<div class="flex items-start gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-all cursor-pointer">
<span class="material-symbols-outlined text-tertiary-container">info</span>
<div>
<p class="text-body-md font-bold text-on-surface">Nueva Asignación</p>
<p class="text-label-md text-on-surface-variant">Puesto: Gerencia TI - Dell XPS 15</p>
</div>
</div>
</div>
</div>
 <div class="lg:col-span-2 bg-ucc-secondary text-white p-6 rounded-xl relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
<div class="relative z-10">
<h3 class="font-title-lg text-title-lg mb-2">Auditoría Semestral</h3>
<p class="text-body-md opacity-80 mb-6">Faltan 14 días para el próximo cierre de auditoría de seguridad informática y hardware.</p>
<div class="flex gap-4">
<button class="bg-primary-container text-on-primary-fixed-variant px-6 py-2 rounded-lg font-label-md text-label-md hover:brightness-110 transition-all">Iniciar Pre-auditoría</button>
<button class="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-label-md text-label-md transition-all">Descargar Reporte</button>
</div>
</div> 
<div class="absolute -right-10 -bottom-10 opacity-20 rotate-12">
<span class="material-symbols-outlined text-[200px]">security</span>
</div>
</div>
</div>-->
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPuestos().subscribe(res => this.totalPuestos = res.length);
    this.api.getEmpleados().subscribe(res => this.totalColaboradores = res.length);
    this.api.getSoftwareLocales().subscribe(res => this.totalSoftware = res.length);
    this.api.getHardwareAsignado().subscribe(res => {
      this.totalEquipos = res.length;

      // Calculate dummy data based on total for the chart
      this.operativosCount = Math.floor(this.totalEquipos * 0.75);
      this.gerencialesCount = Math.floor(this.totalEquipos * 0.15);
      this.directivosCount = this.totalEquipos - this.operativosCount - this.gerencialesCount;
    });
  }
}
