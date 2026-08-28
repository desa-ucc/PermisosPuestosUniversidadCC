import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';
import { Puesto } from '../../models/models';

@Component({
  selector: 'app-comparativa-hardware',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
         <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Comparativa de Hardware (Gap Analysis)</h2>
         <p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Comparativa entre Equipo Ideal y Hardware Asignado por Colaborador.</p>
      </div>

      @if(puedeVer) {
        <section class="ucc-card mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <!-- Buscador de texto libre -->
                <div>
                    <label class="ucc-label">Buscador General</label>
                    <input type="text" [(ngModel)]="filtros.busqueda" (input)="aplicarFiltros()" placeholder="Buscar empleado, procesador, etc..." class="ucc-input w-full">
                </div>

                <!-- Combobox de Puesto -->
                <div>
                    <label class="ucc-label">Filtrar por Puesto</label>
                    <div class="relative">
                        <select [(ngModel)]="filtros.puesto" (change)="aplicarFiltros()" class="ucc-input w-full appearance-none pr-8">
                            <option value="">-- Todos los Puestos --</option>
                            @for(p of listaPuestos; track p) {
                                <option [value]="p">{{ p }}</option>
                            }
                        </select>
                        <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                </div>

                <!-- Input de RAM -->
                <div>
                    <label class="ucc-label">Capacidad de RAM (Asignada)</label>
                    <input type="text" [(ngModel)]="filtros.ram" (input)="aplicarFiltros()" placeholder="Ej. 16GB o 16" class="ucc-input w-full">
                </div>
            </div>
        </section>

        <section class="ucc-table-container">
            <div class="p-6 flex justify-between items-center bg-ucc-secondary border-b border-ucc-neutral-outline/25" style="background-color: #356575;">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <span class="material-symbols-outlined">compare_arrows</span> Tabla Comparativa
                </h3>
            </div>

            <div class="overflow-x-auto">
                <table class="ucc-table">
                    <thead>
                        <tr>
                            <th class="py-4 px-6">Empleado</th>
                            <th class="py-4 px-6">Puesto</th>
                            <th class="py-4 px-6">Tipo Equipo (Ideal vs Actual)</th>
                            <th class="py-4 px-6">Procesador (Ideal vs Actual)</th>
                            <th class="py-4 px-6">RAM (Ideal vs Actual)</th>
                            <th class="py-4 px-6">Estado Global</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-ucc-neutral-outline/20">
                        @for (item of listaFiltrada; track item.empleado) {
                            <tr class="hover:bg-ucc-surface-container-low transition-colors duration-200 cursor-default">
                                <td class="py-4 px-6">
                                    <div class="font-bold text-ucc-secondary">{{ item.empleado }}</div>
                                </td>
                                <td class="py-4 px-6 text-ucc-neutral-text">{{ item.puesto || 'N/A' }}</td>

                                <td class="py-4 px-6">
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider mb-1">Ideal: <span class="font-bold text-ucc-neutral-text">{{ item.idealTipo || 'N/A' }}</span></div>
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider">Actual:
                                        <span class="font-bold" [ngClass]="item.asignadoTipo === item.idealTipo ? 'text-green-600' : 'text-amber-600'">{{ item.asignadoTipo || 'N/A' }}</span>
                                    </div>
                                </td>

                                <td class="py-4 px-6">
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider mb-1">Ideal: <span class="font-bold text-ucc-neutral-text">{{ item.idealProcesador || 'N/A' }}</span></div>
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider">Actual:
                                        <span class="font-bold" [ngClass]="compararBrecha(item.idealProcesador, item.asignadoProcesador) ? 'text-green-600' : 'text-amber-600'">{{ item.asignadoProcesador || 'N/A' }}</span>
                                    </div>
                                </td>

                                <td class="py-4 px-6">
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider mb-1">Ideal: <span class="font-bold text-ucc-neutral-text">{{ item.idealMemoria || 'N/A' }}</span></div>
                                    <div class="text-xs text-ucc-neutral-variant uppercase tracking-wider">Actual:
                                        <span class="font-bold" [ngClass]="compararBrecha(item.idealMemoria, item.asignadoMemoria) ? 'text-green-600' : 'text-red-600'">{{ item.asignadoMemoria || 'N/A' }}</span>
                                    </div>
                                </td>

                                <td class="py-4 px-6">
                                    @if(esGlobalCumple(item)) {
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                            <span class="material-symbols-outlined text-[16px]">check_circle</span> Cumple
                                        </span>
                                    } @else {
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                            <span class="material-symbols-outlined text-[16px]">warning</span> No Cumple / Brecha
                                        </span>
                                    }
                                </td>
                            </tr>
                        } @empty {
                            <tr><td colspan="6" class="p-8 text-center text-ucc-neutral-variant italic">No se encontraron comparativas.</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </section>

      } @else {
        <div class="ucc-card text-center py-12">
            <span class="material-symbols-outlined text-6xl text-red-400 mb-4 block">gpp_maybe</span>
            <h3 class="text-xl font-bold text-slate-800">Acceso Restringido</h3>
            <p class="text-slate-500 mt-2">No tienes permisos para ver el módulo de Comparativa.</p>
        </div>
      }
    </div>
  `
})
export class ComparativaHardwareComponent implements OnInit {
  puedeVer = false;

  listaComparativas: any[] = [];
  listaFiltrada: any[] = [];
  listaPuestos: string[] = [];

  filtros = {
      busqueda: '',
      puesto: '',
      ram: ''
  };

  constructor(
    private api: ApiService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.evaluarPermisos();
    if (this.puedeVer) {
        this.loadData();
    }
  }

  evaluarPermisos() {
    this.puedeVer = this.permissionService.tienePermiso('COMPARATIVA', 'ver') || this.permissionService.tienePermiso('EQUIPO_IDEAL', 'ver');
  }

  loadData() {
      // Cargar lista de puestos oficiales desde el API
      this.api.getPuestos().subscribe((res: Puesto[]) => {
          this.listaPuestos = res
              .filter(item => item.nombrePuesto != null && item.nombrePuesto !== 'undefined' && item.nombrePuesto.trim() !== '')
              .map(item => item.nombrePuesto)
              .sort();
      });

      // Cargar la tabla
      this.api.getComparativasHardware().subscribe(data => {
          this.listaComparativas = data;
          this.listaFiltrada = [...data];
      });
  }

  aplicarFiltros() {
      this.listaFiltrada = this.listaComparativas.filter(item => {
          const busquedaL = this.filtros.busqueda ? this.filtros.busqueda.toLowerCase() : '';
          const matchBusqueda = !busquedaL ||
             ((item.empleado ? item.empleado.toLowerCase() : '').includes(busquedaL) ||
              (item.puesto ? item.puesto.toLowerCase() : '').includes(busquedaL) ||
              (item.asignadoProcesador ? item.asignadoProcesador.toLowerCase() : '').includes(busquedaL));

          const matchPuesto = !this.filtros.puesto || item.puesto === this.filtros.puesto;

          const ramL = this.filtros.ram ? this.filtros.ram.toLowerCase() : '';
          const matchRam = !ramL || (item.asignadoMemoria ? item.asignadoMemoria.toLowerCase() : '').includes(ramL);

          return matchBusqueda && matchPuesto && matchRam;
      });
  }

  // Lógica difusa simple para no penalizar mayúsculas/minúsculas o pequeños errores tipográficos
  compararBrecha(ideal: string, actual: string): boolean {
      if(!ideal && actual) return true;
      if(!actual) return false;
      if(!ideal) return true; // Si ideal es nulo y actual tambien es nulo, esta OK
      return ideal.toLowerCase().trim() === actual.toLowerCase().trim();
  }

  esGlobalCumple(item: any): boolean {
      return this.compararBrecha(item.idealTipo, item.asignadoTipo) &&
             this.compararBrecha(item.idealProcesador, item.asignadoProcesador) &&
             this.compararBrecha(item.idealMemoria, item.asignadoMemoria);
  }
}
