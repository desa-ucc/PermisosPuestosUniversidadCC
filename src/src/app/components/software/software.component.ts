import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SoftwareLocal, HardwareAsignado } from '../../models/models';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Software Local</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Software Local' : (isEditing ? 'Editar Software Local' : 'Registrar Software Local') }}</h3></div>
        <form [formGroup]="swForm" (ngSubmit)="onSubmit()" >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input type="text"
                       class="ucc-input w-full"
                       placeholder="Buscar o seleccionar equipo..."
                       [(ngModel)]="searchTermEquipos"
                       [ngModelOptions]="{standalone: true}"
                       (focus)="showDropdownEquipos = true"
                       (blur)="cerrarDropdownEquipos()"
                       [disabled]="isReadOnly">

                <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                    [hidden]="!showDropdownEquipos || isReadOnly">
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarEquipo(null)">Ninguno</li>
                  @for(eq of equiposFiltrados; track eq.id) {
                    <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                        (mousedown)="seleccionarEquipo(eq)">
                      {{eq.placa}} - {{eq.marcaPC}}
                    </li>
                  } @empty {
                    <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                  }
                </ul>
              </div>
              @if(swForm.get('empleadoId')?.invalid && swForm.get('empleadoId')?.touched) {
                <span class="text-red-400 text-xs mt-1">El equipo/empleado es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Nombre Equipo en Red</label>
              <input formControlName="equipo" placeholder="Nombre Equipo en Red" class="ucc-input">
              @if(swForm.get('equipo')?.invalid && swForm.get('equipo')?.touched) {
                <span class="text-red-400 text-xs mt-1">El equipo en red es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Grupos AD</label>
              <input formControlName="gruposAD" placeholder="Grupos AD" class="ucc-input">
              @if(swForm.get('gruposAD')?.invalid && swForm.get('gruposAD')?.touched) {
                <span class="text-red-400 text-xs mt-1">Los grupos AD son requeridos.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Nombre Software</label>
              <input formControlName="nombreSoftware" placeholder="Nombre Software" class="ucc-input">
              @if(swForm.get('nombreSoftware')?.invalid && swForm.get('nombreSoftware')?.touched) {
                <span class="text-red-400 text-xs mt-1">El nombre de software es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Versión</label>
              <input formControlName="version" placeholder="Versión" class="ucc-input">
              @if(swForm.get('version')?.invalid && swForm.get('version')?.touched) {
                <span class="text-red-400 text-xs mt-1">La versión es requerida.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Fabricante</label>
              <input formControlName="fabricante" placeholder="Fabricante" class="ucc-input">
              @if(swForm.get('fabricante')?.invalid && swForm.get('fabricante')?.touched) {
                <span class="text-red-400 text-xs mt-1">El fabricante es requerido.</span>
              }
            </div>
          </div>

          <div class="mt-4">
            @if(!isReadOnly) {
              <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="swForm.invalid" class="ucc-btn-primary">
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
        <div class="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ucc-neutral-outline/25 bg-ucc-secondary" style="background-color: #356575;">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">table_chart</span> Registros Actuales
          </h3>
          <div class="flex gap-2">
             <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'crear'}" type="button" (click)="descargarPlantilla()" class="flex items-center gap-2 px-4 py-2 bg-ucc-surface-container text-ucc-neutral-text rounded-md text-sm hover:bg-ucc-surface-container-high transition-colors">
               <span class="material-symbols-outlined text-[18px]">download</span> Plantilla Excel
             </button>
             <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'crear'}" type="button" (click)="fileInput.click()" class="flex items-center gap-2 px-4 py-2 bg-ucc-primary-container text-ucc-on-primary-container rounded-md text-sm hover:bg-ucc-primary/80 transition-colors">
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
              <th>Equipo Asignado</th>
              <th>Software</th>
              <th>Versión</th>
              <th>Fabricante</th>
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

              <!-- Equipo Asignado -->
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

              <!-- Software -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroSoftware" (input)="aplicarFiltros()" (focus)="showFiltroSw = true" (blur)="cerrarFiltroSw()" placeholder="Buscar software..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroSw) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroSoftware('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (sw of softwareTablaFiltrados; track sw) {
                      <li (mousedown)="seleccionarFiltroSoftware(sw)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ sw }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Versión -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroVersion" (input)="aplicarFiltros()" (focus)="showFiltroVer = true" (blur)="cerrarFiltroVer()" placeholder="Buscar versión..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroVer) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroVersion('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (v of versionesTablaFiltradas; track v) {
                      <li (mousedown)="seleccionarFiltroVersion(v)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ v }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Fabricante -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroFabricante" (input)="aplicarFiltros()" (focus)="showFiltroFab = true" (blur)="cerrarFiltroFab()" placeholder="Buscar fabricante..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroFab) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroFabricante('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (f of fabricantesTablaFiltrados; track f) {
                      <li (mousedown)="seleccionarFiltroFabricante(f)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ f }}</li>
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
            @for(sw of paginatedList; track sw.id) {
              <tr>
                <td>{{sw.codigoPuesto}}</td>
                <td>{{sw.nombrePuesto || getPuestoByEmpleadoId(sw.empleadoId)}}</td>
                <td>{{getEquipoPlaca(sw.empleadoId)}}</td>
                <td>{{sw.nombreSoftware}}</td> 
                <td>{{sw.version}}</td>
                <td>{{sw.fabricante}}</td>
                <td>
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'EDITAR'}" (click)="edit(sw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button *appPermiso="{pantalla: 'SOFTWARE_LOCAL', accion: 'ELIMINAR'}" (click)="delete(sw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
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
                        No hay software registrado en el sistema.
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

    <!-- Modal de Resultados de Importación -->
    @if(showImportModal && importResult) {
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="cerrarImportModal()"></div>

        <!-- Modal Content -->
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col overflow-hidden animate-fade-in-up border border-slate-200">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span class="material-symbols-outlined text-ucc-primary">assignment_turned_in</span>
                    Resultados de Importación
                </h3>
                <button (click)="cerrarImportModal()" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div class="flex flex-wrap gap-4 mb-6">
                    <div class="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span class="text-3xl font-bold text-green-600">{{ importResult.totalExitosos || 0 }}</span>
                        <span class="text-sm font-medium text-green-800 mt-1">Registros Exitosos</span>
                    </div>
                    <div class="flex-1 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span class="text-3xl font-bold text-red-600">{{ importResult.totalFallidos || 0 }}</span>
                        <span class="text-sm font-medium text-red-800 mt-1">Registros Fallidos</span>
                    </div>
                </div>

                @if(importResult.totalFallidos > 0 || (importResult.errores && importResult.errores.length > 0)) {
                    <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-red-500 text-lg">error</span>
                        Detalle de Errores:
                    </h4>
                    <ul class="space-y-2">
                        @for(err of importResult.errores; track err) {
                            <li class="bg-red-50/50 text-red-700 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                                <span class="material-symbols-outlined text-base mt-0.5 opacity-70">info</span>
                                <span>{{ err }}</span>
                            </li>
                        }
                    </ul>
                } @else {
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-symbols-outlined text-3xl">check</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-800">¡Importación Perfecta!</h4>
                        <p class="text-slate-500 mt-1">Todos los registros fueron procesados e insertados exitosamente.</p>
                    </div>
                }
            </div>

            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button (click)="cerrarImportModal()" class="ucc-btn-primary">
                    Aceptar
                </button>
            </div>
        </div>
    </div>
    }
  `
})
export class SoftwareComponent implements OnInit {
  showImportModal = false;
  importResult: any = null;

  empleados: any[] = [];
  puestos: any[] = [];
  listaFiltradaTabla: any[] = [];

  showFiltroCodP = false;
  showFiltroP = false;
  showFiltroEq = false;
  showFiltroSw = false;
  showFiltroVer = false;
  showFiltroFab = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.softwareList.map(s => s.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.softwareList.map(s => s.nombrePuesto || this.getPuestoByEmpleadoId(s.empleadoId)).filter((p): p is string => Boolean(p)))).sort();
  }

  get equiposUnicos(): string[] {
    return Array.from(new Set(this.softwareList.map(s => this.getEquipoPlaca(s.empleadoId)).filter((eq): eq is string => Boolean(eq)))).sort();
  }

  get softwareUnicos(): string[] {
    return Array.from(new Set(this.softwareList.map(s => s.nombreSoftware).filter((sw): sw is string => Boolean(sw)))).sort();
  }

  get versionesUnicas(): string[] {
    return Array.from(new Set(this.softwareList.map(s => s.version).filter((v): v is string => Boolean(v)))).sort();
  }

  get fabricantesUnicos(): string[] {
    return Array.from(new Set(this.softwareList.map(s => s.fabricante).filter((f): f is string => Boolean(f)))).sort();
  }

  get codigosPuestoFiltrados() {
    return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
  }

  get puestosTablaFiltrados() {
    return this.puestosUnicos.filter(p => p.toLowerCase().includes(this.filtroPuesto.toLowerCase()));
  }

  get equiposTablaFiltrados() {
    return this.equiposUnicos.filter(eq => eq.toLowerCase().includes(this.filtroEquipo.toLowerCase()));
  }

  get softwareTablaFiltrados() {
    return this.softwareUnicos.filter(sw => sw.toLowerCase().includes(this.filtroSoftware.toLowerCase()));
  }

  get versionesTablaFiltradas() {
    return this.versionesUnicas.filter(v => v.toLowerCase().includes(this.filtroVersion.toLowerCase()));
  }

  get fabricantesTablaFiltrados() {
    return this.fabricantesUnicos.filter(f => f.toLowerCase().includes(this.filtroFabricante.toLowerCase()));
  }

  seleccionarFiltroCodigoPuesto(val: string) { this.filtroCodigoPuesto = val; this.showFiltroCodP = false; this.aplicarFiltros(); }
  seleccionarFiltroPuesto(val: string) { this.filtroPuesto = val; this.showFiltroP = false; this.aplicarFiltros(); }
  seleccionarFiltroEquipo(val: string) { this.filtroEquipo = val; this.showFiltroEq = false; this.aplicarFiltros(); }
  seleccionarFiltroSoftware(val: string) { this.filtroSoftware = val; this.showFiltroSw = false; this.aplicarFiltros(); }
  seleccionarFiltroVersion(val: string) { this.filtroVersion = val; this.showFiltroVer = false; this.aplicarFiltros(); }
  seleccionarFiltroFabricante(val: string) { this.filtroFabricante = val; this.showFiltroFab = false; this.aplicarFiltros(); }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroP() { setTimeout(() => this.showFiltroP = false, 200); }
  cerrarFiltroEq() { setTimeout(() => this.showFiltroEq = false, 200); }
  cerrarFiltroSw() { setTimeout(() => this.showFiltroSw = false, 200); }
  cerrarFiltroVer() { setTimeout(() => this.showFiltroVer = false, 200); }
  cerrarFiltroFab() { setTimeout(() => this.showFiltroFab = false, 200); }

  aplicarFiltros() {
    if (!this.softwareList || this.softwareList.length === 0) {
      this.listaFiltradaTabla = [];
      return;
    }

    this.listaFiltradaTabla = this.softwareList.filter((item: any) => {
      const matchCod = !this.filtroCodigoPuesto || (item.codigoPuesto && item.codigoPuesto.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
      const matchPuesto = !this.filtroPuesto || ((item.nombrePuesto || this.getPuestoByEmpleadoId(item.empleadoId)).toLowerCase().includes(this.filtroPuesto.toLowerCase()));
      const matchEquipo = !this.filtroEquipo || (this.getEquipoPlaca(item.empleadoId).toLowerCase().includes(this.filtroEquipo.toLowerCase()));
      const matchSoftware = !this.filtroSoftware || ((item.nombreSoftware || '').toLowerCase().includes(this.filtroSoftware.toLowerCase()));
      const matchVersion = !this.filtroVersion || ((item.version || '').toLowerCase().includes(this.filtroVersion.toLowerCase()));
      const matchFabricante = !this.filtroFabricante || ((item.fabricante || '').toLowerCase().includes(this.filtroFabricante.toLowerCase()));

      return matchCod && matchPuesto && matchEquipo && matchSoftware && matchVersion && matchFabricante;
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
      { field: 'equipo', placeholder: 'Equipo', type: 'text' },
      { field: 'gruposAD', placeholder: 'Grupos AD', type: 'text' },
      { field: 'nombreSoftware', placeholder: 'Software', type: 'text' },
      { field: 'version', placeholder: 'Versión', type: 'text' },
      { field: 'fabricante', placeholder: 'Fabricante', type: 'text' }
    ];
  }

  // Filtros de Tabla
  filtroCodigoPuesto: string = '';
  filtroPuesto: string = '';
  filtroEquipo: string = '';
  filtroSoftware: string = '';
  filtroVersion: string = '';
  filtroFabricante: string = '';

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      'PUESTO': row.nombrePuesto || this.getPuestoByEmpleadoId(row.empleadoId) || 'N/A',
      'EQUIPO': this.getEquipoPlaca(row.empleadoId) || 'N/A',
      'SOFTWARE': row.nombreSoftware || 'N/A',
      'VERSIÓN': row.version || 'N/A',
      'FABRICANTE': row.fabricante || 'N/A',
      'SISTEMA OPERATIVO': row.sistemaOperativo || 'N/A',
      'OBSERVACIONES': row.observaciones || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 30}, {wch: 30}, {wch: 20}, {wch: 25}, {wch: 25}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, ws, 'Software Local');
    XLSX.writeFile(wb, `Reporte_Software_Local.xlsx`);
  }

  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPuesto = '';
    this.filtroEquipo = '';
    this.filtroSoftware = '';
    this.filtroVersion = '';
    this.filtroFabricante = '';
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  softwareList: SoftwareLocal[] = [];
  equipos: HardwareAsignado[] = [];
  swForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showDropdownEquipos = false;
  searchTermEquipos = '';

  get equiposFiltrados() {
    return this.equipos.filter(e => {
        const fullString = `${e.placa} - ${e.marcaPC}`.toLowerCase();
        return fullString.includes(this.searchTermEquipos.toLowerCase());
    });
  }

  seleccionarEquipo(equipo: HardwareAsignado | null) {
    if (equipo) {
        this.swForm.patchValue({ empleadoId: equipo.empleadoId });
        this.searchTermEquipos = `${equipo.placa} - ${equipo.marcaPC}`;
    } else {
        this.swForm.patchValue({ empleadoId: null });
        this.searchTermEquipos = '';
    }
    this.showDropdownEquipos = false;
  }

  cerrarDropdownEquipos() {
    setTimeout(() => {
      this.showDropdownEquipos = false;
      const currentId = this.swForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEquipos = '';
      } else {
          const matched = this.equipos.find(e => e.empleadoId === currentId);
          if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
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

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.swForm = this.fb.group({
      empleadoId: [null, Validators.required],
      equipo: ['', Validators.required],
      gruposAD: ['', Validators.required],
      nombreSoftware: ['', Validators.required],
      version: ['', Validators.required],
      fabricante: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.updateFilterConfig();
  }

  loadData() {
    this.api.getSoftwareLocales().subscribe({
      next: (res: any) => {
        this.softwareList = Array.isArray(res) ? res : [];
        this.listaFiltradaTabla = [...this.softwareList];
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error fatal al cargar software:', err)
    });

    this.api.getHardwareAsignado().subscribe({
      next: (res: any) => {
        this.equipos = res;
      },
      error: (err) => console.error('Error en Hardware:', err)
    });
  }

  getPuestoByEmpleadoId(empleadoId: number): string {
    const hw = this.equipos.find(e => e.empleadoId === empleadoId);
    return hw && hw.nombrePuesto ? hw.nombrePuesto : 'N/A';
  }

  getEquipoPlaca(empleadoId: number): string {
    return this.equipos.find(e => e.empleadoId === empleadoId)?.placa || 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.swForm.markAllAsTouched();
    if (this.swForm.invalid) return;

    const data = this.swForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateSoftwareLocal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro de software.')
      });
    } else {
      this.api.createSoftwareLocal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro de software.')
      });
    }
  }

  edit(sw: SoftwareLocal) {
    if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sw.id;
    this.swForm.enable();
    this.searchTermEquipos = '';
    this.swForm.patchValue(sw);
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
    } else {
        this.searchTermEquipos = '';
    }
  }


  // MÉTODOS DE EXCEL
  descargarPlantilla() {
    this.api.descargarPlantillaSoftwareLocal().subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Software_Local.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  cargarExcel(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.api.importarSoftwareLocal(file).subscribe({
        next: (res: any) => {
           this.importResult = res;
           this.showImportModal = true;
           this.loadData();
           event.target.value = '';
        },
        error: (err: any) => {
           let fallidos = err.error?.TotalFallidos || 0;
           let exitosos = err.error?.TotalExitosos || 0;
           let msg = err.error?.message || 'Error interno del servidor.';

           let listaErrores = err.error?.errores || err.error?.Errores;
           if (!listaErrores || !Array.isArray(listaErrores)) {
               listaErrores = [msg, 'Revise que la plantilla sea correcta y los códigos existan.'];
               fallidos = fallidos || 1;
           }

           this.importResult = {
               totalExitosos: exitosos,
               totalFallidos: fallidos,
               errores: listaErrores
           };
           this.showImportModal = true;
           event.target.value = '';
        }
      });
    }
  }

  cerrarImportModal() {
      this.showImportModal = false;
      this.importResult = null;
  }

  delete(id: number) {
    if(confirm('¿Está Seguro de que desea eliminar este registro de software?')) {
      this.api.deleteSoftwareLocal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(sw: SoftwareLocal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sw.id;
    this.swForm.patchValue(sw);
    this.swForm.disable();
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = `${matched.placa} - ${matched.marcaPC}`;
    } else {
        this.searchTermEquipos = '';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.swForm.reset({
      empleadoId: null,
      equipo: '',
      gruposAD: '',
      nombreSoftware: '',
      version: '',
      fabricante: ''
    });
    this.swForm.enable();
    this.searchTermEquipos = '';
  }
}