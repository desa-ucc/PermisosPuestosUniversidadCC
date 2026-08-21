import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import { HardwareAsignado, Empleado, Puesto, Catalogo } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hardware',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Hardware Asignado</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Hardware' : (isEditing ? 'Editar Hardware' : 'Registrar Hardware') }}</h3></div>
<form [formGroup]="hwForm" (ngSubmit)="onSubmit()" >
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Seleccione Opción</label>
<div class="relative">
              <input type="text"
                     class="ucc-input w-full"
                     placeholder="Buscar o seleccionar empleado..."
                     [(ngModel)]="searchTermEmpleados"
                     [ngModelOptions]="{standalone: true}"
                     (focus)="showDropdownEmpleados = true"
                     (blur)="cerrarDropdownEmpleados()"
                     [disabled]="isReadOnly">

              <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                  [hidden]="!showDropdownEmpleados || isReadOnly">
                <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                    (mousedown)="seleccionarEmpleado(null)">Ninguno</li>
                @for(emp of empleadosFiltrados; track emp.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarEmpleado(emp)">
                    {{emp.nombreCompleto}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            @if(hwForm.get('empleadoId')?.invalid && hwForm.get('empleadoId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
            }
            <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
          </div>

          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Equipo (Tipo ej. Laptop)</label>
<select formControlName="tipoHardwareId" class="ucc-input" (change)="onTipoHardwareChangeSelect($event)">
              <option value="" disabled selected>Seleccione un tipo</option>
              @for(tipo of tiposHardware; track tipo.id) {
                <option [value]="tipo.id">{{tipo.nombre}}</option>
              }
            </select>
            @if(hwForm.get('tipoHardwareId')?.invalid && hwForm.get('tipoHardwareId')?.touched) {
              <span class="text-red-400 text-xs mt-1">El tipo de equipo es requerido.</span>
            }
          </div>

          @if(isPC) {
          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Procesador</label>
<input formControlName="procesador" placeholder="Procesador" class="ucc-input">
            @if(hwForm.get('procesador')?.invalid && hwForm.get('procesador')?.touched) {
              <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
            }
          </div>
          }

          @if(isPC) {
          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Memoria RAM</label>
<input formControlName="memoria" placeholder="Memoria RAM" class="ucc-input">
            @if(hwForm.get('memoria')?.invalid && hwForm.get('memoria')?.touched) {
              <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
            }
          </div>
          }

          @if(isPC) {
          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Disco Duro</label>
<input formControlName="disco" placeholder="Disco Duro" class="ucc-input">
            @if(hwForm.get('disco')?.invalid && hwForm.get('disco')?.touched) {
              <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
            }
          </div>
          }

         
          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Marca</label>
<input formControlName="marcaPC" placeholder="Marca " class="ucc-input">
            @if(hwForm.get('marcaPC')?.invalid && hwForm.get('marcaPC')?.touched) {
              <span class="text-red-400 text-xs mt-1">La marca es requerida.</span>
            }
          </div>
          

          <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
            <label class="ucc-label">Placa de Activo</label>
<input formControlName="placa" placeholder="Placa de Activo" class="ucc-input">
            @if(hwForm.get('placa')?.invalid && hwForm.get('placa')?.touched) {
              <span class="text-red-400 text-xs mt-1">La placa es requerida.</span>
            }
          </div>


          <div class="flex flex-col w-full transition-all duration-300">
            <label class="ucc-label">Otras Consideraciones</label>
<input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones" class="ucc-input">
          </div>
        </div>

        <div class="mt-4">
          @if(!isReadOnly) {
  <button *appPermiso="{pantalla: 'HARDWARE', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="hwForm.invalid" class="ucc-btn-primary">
    @if(isEditing) {
      Actualizar
    } @else {
      Agregar
    }
  </button>
}

          @if(isEditing || isReadOnly) {
  <button type="button" (click)="resetForm()" class="ucc-btn-secondary">
    {{ isReadOnly ? 'Volver' : 'Cancelar' }}
  </button>
}
        </div>
      </form>
</section>

      <section class="ucc-table-container">
<div class="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ucc-neutral-outline/20 bg-ucc-secondary" style="background-color: #356575;">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">table_chart</span> Registros Actuales
          </h3>
          <div class="flex gap-2">
             <button *appPermiso="{pantalla: 'HARDWARE', accion: 'crear'}" type="button" (click)="descargarPlantilla()" class="flex items-center gap-2 px-4 py-2 bg-ucc-surface-container text-ucc-neutral-text rounded-md text-sm hover:bg-ucc-surface-container-high transition-colors">
               <span class="material-symbols-outlined text-[18px]">download</span> Plantilla Excel
             </button>
             <button *appPermiso="{pantalla: 'HARDWARE', accion: 'crear'}" type="button" (click)="fileInput.click()" class="flex items-center gap-2 px-4 py-2 bg-ucc-primary-container text-ucc-on-primary-container rounded-md text-sm hover:bg-ucc-primary/80 transition-colors">
               <span class="material-symbols-outlined text-[18px]">upload</span> Subir Excel
             </button>
             <input type="file" #fileInput (change)="cargarExcel($event)" accept=".xlsx" style="display: none;" />
          </div>
        </div>
<table class="ucc-table">
          <thead>
            <tr>
              <th>Código Puesto</th>
              <th>Puesto</th>
              <th>Nombre de persona</th>
              <th>Equipo</th>
              <th>Marca</th>
              <th>Placa</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>

          <!-- FILA DE FILTROS TIPO COMBOBOX BUSCABLE AMPLIOS Y ESTILIZADOS -->
          <tr class="bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20">
            <!-- Código Puesto -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroCodigoPuesto" (input)="aplicarFiltros()" (focus)="showFiltroCodP = true" (blur)="cerrarFiltroCodP()" placeholder="Buscar cód..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroCodP) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroCodigoPuesto('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (c of codigosPuestoFiltrados; track c) {
                    <li (mousedown)="seleccionarFiltroCodigoPuesto(c)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ c }}</li>
                  }
                </ul>
              }
            </td>

            <!-- Puesto -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroPuesto" (input)="aplicarFiltros()" (focus)="showFiltroP = true" (blur)="cerrarFiltroP()" placeholder="Buscar puesto..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroP) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroPuesto('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (p of puestosTablaFiltrados; track p) {
                    <li (mousedown)="seleccionarFiltroPuesto(p)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ p }}</li>
                  }
                </ul>
              }
            </td>

            <!-- Persona -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroEmpleado" (input)="aplicarFiltros()" (focus)="showFiltroEmp = true" (blur)="cerrarFiltroEmp()" placeholder="Buscar persona..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroEmp) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroEmpleado('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (e of empleadosTablaFiltrados; track e) {
                    <li (mousedown)="seleccionarFiltroEmpleado(e)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ e }}</li>
                  }
                </ul>
              }
            </td>

            <!-- Equipo -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroEquipo" (input)="aplicarFiltros()" (focus)="showFiltroEq = true" (blur)="cerrarFiltroEq()" placeholder="Buscar equipo..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroEq) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroEquipo('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (eq of equiposTablaFiltrados; track eq) {
                    <li (mousedown)="seleccionarFiltroEquipo(eq)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ eq }}</li>
                  }
                </ul>
              }
            </td>

            <!-- Marca -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroMarca" (input)="aplicarFiltros()" (focus)="showFiltroMar = true" (blur)="cerrarFiltroMar()" placeholder="Buscar marca..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroMar) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroMarca('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (m of marcasTablaFiltradas; track m) {
                    <li (mousedown)="seleccionarFiltroMarca(m)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ m }}</li>
                  }
                </ul>
              }
            </td>

            <!-- Placa -->
            <td class="p-3 relative">
              <input type="text" [(ngModel)]="filtroPlaca" (input)="aplicarFiltros()" (focus)="showFiltroPla = true" (blur)="cerrarFiltroPla()" placeholder="Buscar placa..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
              @if (showFiltroPla) {
                <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  <li (mousedown)="seleccionarFiltroPlaca('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                  @for (pl of placasTablaFiltradas; track pl) {
                    <li (mousedown)="seleccionarFiltroPlaca(pl)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pl }}</li>
                  }
                </ul>
              }
            </td>

            <td class="p-3 text-center">
              <div class="flex justify-center">
                <div class="flex flex-col gap-1">
                  <button (click)="exportarReporte()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors"><span class="material-symbols-outlined text-[16px]">download</span> Generar Reporte</button>
                  <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors"><span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar Filtros</button>
                </div>
              </div>
            </td>
          </tr>
          </thead>
          <tbody>
            @for(hw of paginatedList; track hw.id) {
              <tr>
              <td>{{hw.codigoPuesto}}</td>
              <td>{{hw.nombrePuesto}}</td>
              <td>{{hw.nombreCompleto || 'Sin nombre'}}</td>
              <td>{{hw.tipoEquipo || 'N/A'}}</td> 
              <td>{{hw.marcaPC || 'N/A'}}</td>
              <td>{{hw.placa || 'N/A'}}</td>
                <td>
                  <div class="flex justify-center gap-3"><button (click)="verDetalle(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button *appPermiso="{pantalla: 'HARDWARE', accion: 'EDITAR'}" (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button *appPermiso="{pantalla: 'HARDWARE', accion: 'ELIMINAR'}" (click)="delete(hw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button></div>
                </td>
              </tr>
            } @empty {
               <tr>
                  <td
                    colspan="9"
                    class="text-center py-12 text-ucc-neutral-variant"
                  >
                    <div class="flex flex-col items-center gap-3">
                      <span
                        class="material-symbols-outlined text-[48px] opacity-50"
                        >devices</span
                      >
                      <p class="font-medium">
                        No hay hardware asignado registrado en el sistema.
                      </p>
                    </div>
                  </td>
                </tr>
            }
          </tbody>

        </table>

        <!-- FOOTER PAGINACIÓN DINÁMICA -->
        <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface rounded-b-lg">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-ucc-neutral-variant">Mostrar:</span>
            <select class="ucc-input py-1 px-2 text-sm w-20" (change)="changePageSize($event)">
              @for(size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{size}}</option>
              }
            </select>
          </div>

          <span class="text-sm font-medium text-ucc-neutral-variant">Mostrando página {{currentPage}} de {{totalPages}}</span>

          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="currentPage === 1" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface transition-all">Anterior</button>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="px-4 py-2 text-sm font-semibold border border-ucc-neutral-outline rounded-lg hover:bg-ucc-surface-container disabled:opacity-50 disabled:cursor-not-allowed text-ucc-on-surface transition-all">Siguiente</button>
          </div>
        </div>

</section>
    </div>
  `
})
export class HardwareComponent implements OnInit {
  listaFiltradaTabla: any[] = [];

  showFiltroCodP = false;
  showFiltroP = false;
  showFiltroEmp = false;
  showFiltroEq = false;
  showFiltroMar = false;
  showFiltroPla = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.nombrePuesto).filter((p): p is string => Boolean(p)))).sort();
  }

  get empleadosUnicos(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.nombreCompleto).filter((n): n is string => Boolean(n)))).sort();
  }

  get equiposUnicos(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.tipoEquipo).filter((eq): eq is string => Boolean(eq)))).sort();
  }

  get marcasUnicas(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.marcaPC).filter((m): m is string => Boolean(m)))).sort();
  }

  get placasUnicas(): string[] {
    return Array.from(new Set(this.equipos.map(e => e.placa).filter((pl): pl is string => Boolean(pl)))).sort();
  }

  get codigosPuestoFiltrados() {
    return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
  }

  get puestosTablaFiltrados() {
    return this.puestosUnicos.filter(p => p.toLowerCase().includes(this.filtroPuesto.toLowerCase()));
  }

  get empleadosTablaFiltrados() {
    return this.empleadosUnicos.filter(e => e.toLowerCase().includes(this.filtroEmpleado.toLowerCase()));
  }

  get equiposTablaFiltrados() {
    return this.equiposUnicos.filter(eq => eq.toLowerCase().includes(this.filtroEquipo.toLowerCase()));
  }

  get marcasTablaFiltradas() {
    return this.marcasUnicas.filter(m => m.toLowerCase().includes(this.filtroMarca.toLowerCase()));
  }

  get placasTablaFiltradas() {
    return this.placasUnicas.filter(pl => pl.toLowerCase().includes(this.filtroPlaca.toLowerCase()));
  }

  seleccionarFiltroCodigoPuesto(val: string) { this.filtroCodigoPuesto = val; this.showFiltroCodP = false; this.aplicarFiltros(); }
  seleccionarFiltroPuesto(val: string) { this.filtroPuesto = val; this.showFiltroP = false; this.aplicarFiltros(); }
  seleccionarFiltroEmpleado(val: string) { this.filtroEmpleado = val; this.showFiltroEmp = false; this.aplicarFiltros(); }
  seleccionarFiltroEquipo(val: string) { this.filtroEquipo = val; this.showFiltroEq = false; this.aplicarFiltros(); }
  seleccionarFiltroMarca(val: string) { this.filtroMarca = val; this.showFiltroMar = false; this.aplicarFiltros(); }
  seleccionarFiltroPlaca(val: string) { this.filtroPlaca = val; this.showFiltroPla = false; this.aplicarFiltros(); }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroP() { setTimeout(() => this.showFiltroP = false, 200); }
  cerrarFiltroEmp() { setTimeout(() => this.showFiltroEmp = false, 200); }
  cerrarFiltroEq() { setTimeout(() => this.showFiltroEq = false, 200); }
  cerrarFiltroMar() { setTimeout(() => this.showFiltroMar = false, 200); }
  cerrarFiltroPla() { setTimeout(() => this.showFiltroPla = false, 200); }

  aplicarFiltros() {
    const dataList = this.equipos; 

    if (!dataList || dataList.length === 0) {
        this.listaFiltradaTabla = [];
        return;
    }

    this.listaFiltradaTabla = dataList.filter((item: any) => {
      const matchCod = !this.filtroCodigoPuesto || (item.codigoPuesto && item.codigoPuesto.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
      const matchPue = !this.filtroPuesto || (item.nombrePuesto && item.nombrePuesto.toLowerCase().includes(this.filtroPuesto.toLowerCase()));
      const matchEmp = !this.filtroEmpleado || (item.nombreCompleto && item.nombreCompleto.toLowerCase().includes(this.filtroEmpleado.toLowerCase()));
      const matchEq = !this.filtroEquipo || ((item.tipoEquipo || '').toLowerCase().includes(this.filtroEquipo.toLowerCase()));
      const matchMar = !this.filtroMarca || ((item.marcaPC || '').toLowerCase().includes(this.filtroMarca.toLowerCase()));
      const matchPla = !this.filtroPlaca || ((item.placa || '').toLowerCase().includes(this.filtroPlaca.toLowerCase()));

      return matchCod && matchPue && matchEmp && matchEq && matchMar && matchPla;
    });

    this.currentPage = 1;
  }

  filtros: any = {};
  filterConfig: FilterColumn[] = [];

  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
    this.aplicarFiltros();
  }

  updateFilterConfig() {
    this.filterConfig = [
      { field: 'codigoPuesto', placeholder: 'Código Puesto', type: 'text' },
      { field: 'nombreCompleto', placeholder: 'Persona', type: 'select', options: this.empleados, optionValueKey: 'nombreCompleto', optionLabelKey: 'nombreCompleto' },
      { field: 'nombrePuesto', placeholder: 'Puesto', type: 'select', options: this.puestos, optionValueKey: 'nombrePuesto', optionLabelKey: 'nombrePuesto' },
      { field: 'tipoEquipo', placeholder: 'Tipo de Equipo', type: 'select', options: this.tiposHardware, optionValueKey: 'nombre', optionLabelKey: 'nombre' },
      { field: 'placa', placeholder: 'Placa', type: 'text' },
      { field: 'procesador', placeholder: 'Procesador', type: 'text' },
      { field: 'memoria', placeholder: 'Memoria', type: 'text' },
      { field: 'disco', placeholder: 'Disco', type: 'text' },
      { field: 'marcaPC', placeholder: 'Marca PC', type: 'text' },
      { field: 'otrasConsideraciones', placeholder: 'Otras Consideraciones', type: 'text' }
    ];
  }

  tiposHardware: Catalogo[] = [];
  selectedTipoHardwareId: number | null = null;
  getTipoName(tipoId: number | null | undefined, fallback: string): string {
    if (tipoId) {
      const tipo = this.tiposHardware.find(t => t.id === tipoId);
      if (tipo) return tipo.nombre;
    }
    return fallback;
  }


  get isPC(): boolean {
    if (!this.selectedTipoHardwareId) return false;
    const tipo = this.tiposHardware.find(t => t.id === Number(this.selectedTipoHardwareId));
    if (!tipo) return false;
    const nombre = tipo.nombre.toLowerCase();
    return nombre.includes('laptop') || nombre.includes('desktop') || nombre.includes('computadora');
  }

  onTipoHardwareChangeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTipoHardwareId = target.value ? Number(target.value) : null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
  }

  onTipoHardwareChange(tipoId: number | null) {
    this.selectedTipoHardwareId = tipoId;
    const isPC = this.isPC;
    const form = 'hwForm' in this ? (this as any).hwForm : (this as any).hwIdealForm;
    const fields = ['procesador', 'memoria', 'disco', 'marcaPC'];

    fields.forEach(field => {
      const control = form.get(field);
      if (control) {
        if (isPC) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
          control.patchValue(null);
        }
        control.updateValueAndValidity();
      }
    });
  }


  // Filtros de Tabla
  filtroCodigoPuesto: string = '';
  filtroPuesto: string = '';
  filtroEmpleado: string = '';
  filtroEquipo: string = '';
  filtroMarca: string = '';
  filtroPlaca: string = '';

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      'PUESTO': row.nombrePuesto || 'N/A',
      'NOMBRE DE PERSONA': row.nombreCompleto || 'Sin nombre',
      'EQUIPO': row.tipoEquipo || 'N/A',
      'MARCA': row.marcaPC || 'N/A',
      'PLACA': row.placa || 'N/A',
      'PROCESADOR': row.procesador || 'N/A',
      'MEMORIA': row.memoria || 'N/A',
      'DISCO': row.disco || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 30}, {wch: 25}, {wch: 20}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws, 'Hardware Asignado');
    XLSX.writeFile(wb, `Reporte_Hardware_Asignado.xlsx`);
  }

  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPuesto = '';
    this.filtroEmpleado = '';
    this.filtroEquipo = '';
    this.filtroMarca = '';
    this.filtroPlaca = '';
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  equipos: HardwareAsignado[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  hwForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showDropdownEmpleados = false;
  searchTermEmpleados = '';

  get empleadosFiltrados() {
    const filtrados = this.empleados.filter(e => e.nombreCompleto.toLowerCase().includes(this.searchTermEmpleados.toLowerCase()));
    
    // Eliminar duplicados basados en el nombreCompleto
    const unicosMap = new Map();
    for (const emp of filtrados) {
      if (!unicosMap.has(emp.nombreCompleto)) {
        unicosMap.set(emp.nombreCompleto, emp);
      }
    }
    return Array.from(unicosMap.values());
  }

  seleccionarEmpleado(empleado: Empleado | null) {
    if (empleado) {
        this.hwForm.patchValue({ empleadoId: empleado.id });
        this.searchTermEmpleados = empleado.nombreCompleto;
    } else {
        this.hwForm.patchValue({ empleadoId: null });
        this.searchTermEmpleados = '';
    }
    this.showDropdownEmpleados = false;
    this.onEmpleadoChange(null);
  }

  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.hwForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEmpleados = '';
      } else {
          const matched = this.empleados.find(e => e.id === currentId);
          if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }


  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.currentPage = 1;
  }

  selectedEmpleadoPuestoId: number | undefined | null = null;

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.hwForm = this.fb.group({
      empleadoId: [null, Validators.required],
      tipoHardwareId: [null, Validators.required],
      tipoEquipo: [''],
      procesador: ['', Validators.required],
      memoria: ['', Validators.required],
      disco: ['', Validators.required],
      marcaPC: ['', Validators.required],
      otrasConsideraciones: [''],
      placa: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.updateFilterConfig();
  }

  loadData() {
    forkJoin({
      equipos: this.api.getHardwareAsignado(),
      empleados: this.api.getEmpleados(),
      tipos: this.api.getTiposHardware(),
      puestos: this.api.getPuestos()
    }).subscribe({
      next: (res) => {
        this.equipos = res.equipos;
        this.empleados = res.empleados;
        this.tiposHardware = res.tipos;
        this.puestos = res.puestos;

        this.listaFiltradaTabla = [...this.equipos];
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error cargando catálogos o datos:', err);
      }
    });
  }

  onEmpleadoChange(event: any) {
    const empId = this.hwForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find(e => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getEmpleadoName(empleadoId: any): string {
    if (!this.empleados || this.empleados.length === 0) return 'Cargando...';
    const emp = this.empleados.find(e => Number(e.id) === Number(empleadoId));
    return emp ? emp.nombreCompleto : 'No encontrado';
  }

  getPuestoByEmpleado(empleadoId: any): string {
    if (!empleadoId) return 'No Asignado';
    const emp = this.empleados.find(e => Number(e.id) === Number(empleadoId));
    if (!emp || !emp.puestoId) return 'No Asignado';
    return this.puestos.find(p => Number(p.id) === Number(emp.puestoId))?.nombrePuesto || 'Desconocido';
  }

  getPuestoName(puestoId: number | undefined | null): string {
    if (!puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('HARDWARE', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('HARDWARE', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.hwForm.markAllAsTouched();
    if (this.hwForm.invalid) return;

    const data = this.hwForm.value;
    data.empleadoId = Number(data.empleadoId);
    data.tipoHardwareId = this.selectedTipoHardwareId;
    data.tipoEquipo = this.getTipoName(this.selectedTipoHardwareId, data.tipoEquipo);

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareAsignado(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro.')
      });
    } else {
      this.api.createHardwareAsignado(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro.')
      });
    }
  }

  edit(hw: HardwareAsignado) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = hw.id;
    this.hwForm.enable();

    this.hwForm.patchValue({
      empleadoId: hw.empleadoId,
      tipoHardwareId: hw.tipoHardwareId,
      tipoEquipo: hw.tipoEquipo,
      procesador: hw.procesador,
      memoria: hw.memoria,
      disco: hw.disco,
      marcaPC: hw.marcaPC,
      otrasConsideraciones: hw.otrasConsideraciones,
      placa: hw.placa
    });

    this.selectedTipoHardwareId = hw.tipoHardwareId || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
    if (hw.empleadoId) {
        const matched = this.empleados.find(e => e.id === hw.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.onEmpleadoChange(null);
  }


  // MÉTODOS DE EXCEL
  descargarPlantilla() {
    this.api.descargarPlantillaHardwareAsignado().subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Hardware_Asignado.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  cargarExcel(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.api.importarHardwareAsignado(file).subscribe({
        next: (res: any) => {
           alert(res.message);
           this.loadData();
           event.target.value = '';
        },
        error: (err: any) => {
           const errMsg = err.error?.message || 'Error al importar archivo.';
           let detailedErrors = '';
           if (err.error?.errores && err.error.errores.length > 0) {
               detailedErrors = '\n\nErrores:\n' + err.error.errores.slice(0, 5).join('\n');
               if (err.error.errores.length > 5) detailedErrors += '\n...y más.';
           }
           alert(errMsg + detailedErrors);
           event.target.value = '';
        }
      });
    }
  }

  delete(id: number) {

    if (!this.permissionService.tienePermiso('HARDWARE', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está Seguro de que desea eliminar este equipo asignado?')) {
      this.api.deleteHardwareAsignado(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(hw: HardwareAsignado) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwForm.patchValue(hw);
    this.selectedTipoHardwareId = hw.tipoHardwareId || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
    this.onEmpleadoChange(null);
    this.hwForm.disable();
    if (hw.empleadoId) {
        const matched = this.empleados.find(e => e.id === hw.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.selectedTipoHardwareId = null;
    this.onTipoHardwareChange(null);
    this.hwForm.reset({
      empleadoId: null,
      tipoHardwareId: null,
      tipoEquipo: '',
      procesador: '',
      memoria: '',
      disco: '',
      marcaPC: '',
      otrasConsideraciones: '',
      placa: ''
    });
    this.hwForm.enable();
    this.searchTermEmpleados = '';
  }
}