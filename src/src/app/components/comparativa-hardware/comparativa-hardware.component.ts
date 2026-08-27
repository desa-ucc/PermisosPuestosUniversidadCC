import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';

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

                <!-- Combobox de Puesto Searchable -->
                <div class="relative" #dropdownContainer>
                    <label class="ucc-label">Filtrar por Puesto</label>
                    <input
                        type="text"
                        [(ngModel)]="searchPuestoTerm"
                        (input)="onSearchPuestoInput()"
                        (focus)="showPuestoDropdown = true"
                        placeholder="Buscar o seleccionar puesto..."
                        class="ucc-input w-full pr-8">
                    <span class="material-symbols-outlined absolute right-2 top-[34px] text-slate-400 pointer-events-none">expand_more</span>

                    @if(showPuestoDropdown) {
                        <ul class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            <li (mousedown)="seleccionarPuesto('')"
                                class="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-500 italic">
                                -- Todos los Puestos --
                            </li>
                            @for(p of listaPuestosFiltradaDropdown; track p.nombrePuesto) {
                                <li (mousedown)="seleccionarPuesto(p.codigoPuesto + ' - ' + p.nombrePuesto)"
                                    class="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm flex gap-2">
                                    <span class="font-bold text-slate-700">[{{ p.codigoPuesto }}]</span> - <span>{{ p.nombrePuesto }}</span>
                                </li>
                            }
                            @if(listaPuestosFiltradaDropdown.length === 0) {
                                <li class="px-4 py-2 text-sm text-slate-500">No se encontraron puestos.</li>
                            }
                        </ul>
                    }
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

  // Variables para el Dropdown Searchable de Puestos
  listaPuestosOriginal: { codigoPuesto: string, nombrePuesto: string }[] = [];
  listaPuestosFiltradaDropdown: { codigoPuesto: string, nombrePuesto: string }[] = [];
  searchPuestoTerm: string = '';
  showPuestoDropdown: boolean = false;

  filtros = {
      busqueda: '',
      puesto: '',
      ram: ''
  };

  constructor(
    private api: ApiService,
    private permissionService: PermissionService,
    private eRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showPuestoDropdown = false;
    }
  }

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
      // Cargar lista de puestos oficiales desde el API (formateado según memoria)
      this.api.getPuestos().subscribe((res: any[]) => {
          this.listaPuestosOriginal = res
              .filter(item => item.nombrePuesto != null && item.nombrePuesto !== 'undefined' && item.nombrePuesto.trim() !== '')
              .map(item => ({
                  codigoPuesto: item.codigoPuesto || 'S/C',
                  nombrePuesto: item.nombrePuesto
              }))
              .sort((a, b) => a.nombrePuesto.localeCompare(b.nombrePuesto));

          this.listaPuestosFiltradaDropdown = [...this.listaPuestosOriginal];
      });

      // Cargar la tabla
      this.api.getComparativasHardware().subscribe(data => {
          this.listaComparativas = data;
          this.listaFiltrada = [...data];
      });
  }

  // Lógica para Dropdown
  onSearchPuestoInput() {
      this.showPuestoDropdown = true;
      const term = this.searchPuestoTerm.toLowerCase();
      this.listaPuestosFiltradaDropdown = this.listaPuestosOriginal.filter(p =>
          p.nombrePuesto.toLowerCase().includes(term) ||
          p.codigoPuesto.toLowerCase().includes(term)
      );
      // Si el input se vacía y no selecciona del dropdown, borramos el filtro y mostramos todos
      if (!this.searchPuestoTerm) {
          this.filtros.puesto = '';
          this.aplicarFiltros();
      }
  }

  seleccionarPuesto(displayValue: string) {
      this.searchPuestoTerm = displayValue;
      // Extract just the name if the value has the format "[Código] - Nombre"
      let valorFiltro = displayValue;
      if (displayValue && displayValue.includes(' - ')) {
          valorFiltro = displayValue.split(' - ')[1].trim();
      }
      this.filtros.puesto = valorFiltro;
      this.showPuestoDropdown = false;
      this.aplicarFiltros();
  }

  // Lógica de Filtros Generales
  aplicarFiltros() {
      this.listaFiltrada = this.listaComparativas.filter(item => {
          const busquedaL = this.filtros.busqueda ? this.filtros.busqueda.toLowerCase() : '';
          const matchBusqueda = !busquedaL ||
             ((item.empleado ? item.empleado.toLowerCase() : '').includes(busquedaL) ||
              (item.puesto ? item.puesto.toLowerCase() : '').includes(busquedaL) ||
              (item.asignadoProcesador ? item.asignadoProcesador.toLowerCase() : '').includes(busquedaL));

          const puestoFilterL = this.filtros.puesto ? this.filtros.puesto.toLowerCase() : '';
          const itemPuestoL = item.puesto ? item.puesto.toLowerCase() : '';
          const matchPuesto = !puestoFilterL || itemPuestoL.includes(puestoFilterL) || puestoFilterL.includes(itemPuestoL);

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
