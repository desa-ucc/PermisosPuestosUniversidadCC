import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import { HardwareIdeal, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-hardware-ideal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Especificaciones: Equipo Ideal</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles del Equipo Ideal' : (isEditing ? 'Editar Plantilla' : 'Formulario de Registro') }}</h3></div>
        <form [formGroup]="hwIdealForm" (ngSubmit)="onSubmit()" >
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input type="text"
                       class="ucc-input w-full"
                       placeholder="Buscar o seleccionar puesto..."
                       [(ngModel)]="searchTermPuestos"
                       [ngModelOptions]="{standalone: true}"
                       (focus)="showDropdownPuestos = true"
                       (blur)="cerrarDropdownPuestos()"
                       [disabled]="isReadOnly">

                <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                    [hidden]="!showDropdownPuestos || isReadOnly">
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarPuesto(null)">Ninguno</li>
                  @for(puesto of puestosFiltrados; track puesto.id) {
                    <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                        (mousedown)="seleccionarPuesto(puesto)">
                      {{puesto.nombrePuesto}}
                    </li>
                  } @empty {
                    <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                  }
                </ul>
              </div>
              @if(hwIdealForm.get('puestoId')?.invalid && hwIdealForm.get('puestoId')?.touched) {
                <span class="text-red-400 text-xs mt-1">El puesto es requerido.</span>
              }
            </div>

            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Equipo (Tipo ej. Desktop)</label>
              <select formControlName="tipoHardwareId" class="ucc-input" (change)="onTipoHardwareChangeSelect($event)">
                <option value="" disabled selected>Seleccione un tipo</option>
                @for(tipo of tiposHardware; track tipo.id) {
                  <option [value]="tipo.id">{{tipo.nombre}}</option>
                }
              </select>
              @if(hwIdealForm.get('tipoHardwareId')?.invalid && hwIdealForm.get('tipoHardwareId')?.touched) {
                <span class="text-red-400 text-xs mt-1">El tipo de equipo es requerido.</span>
              }
            </div>

            @if(isPC) {
            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Procesador (Mínimo recomendado)</label>
              <input formControlName="procesador" placeholder="Procesador (Mínimo recomendado)" class="ucc-input">
              @if(hwIdealForm.get('procesador')?.invalid && hwIdealForm.get('procesador')?.touched) {
                <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
              }
            </div>
            }

            @if(isPC) {
            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Memoria RAM recomendada</label>
              <input formControlName="memoria" placeholder="Memoria RAM recomendada" class="ucc-input">
              @if(hwIdealForm.get('memoria')?.invalid && hwIdealForm.get('memoria')?.touched) {
                <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
              }
            </div>
            }

            @if(isPC) {
            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Disco Duro</label>
              <input formControlName="disco" placeholder="Disco Duro" class="ucc-input">
              @if(hwIdealForm.get('disco')?.invalid && hwIdealForm.get('disco')?.touched) {
                <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
              }
            </div>
            }

            <div class="flex flex-col flex-1 min-w-[250px] transition-all duration-300">
              <label class="ucc-label">Marca </label>
              <input formControlName="marcaPC" placeholder="Marca" class="ucc-input">
              @if(hwIdealForm.get('marcaPC')?.invalid && hwIdealForm.get('marcaPC')?.touched) {
                <span class="text-red-400 text-xs mt-1">La marca es requerida.</span>
              }
            </div>

            <div class="flex flex-col w-full transition-all duration-300">
              <label class="ucc-label">Otras Consideraciones / Periféricos</label>
              <input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones / Periféricos" class="ucc-input">
            </div>
          </div>

          <div class="mt-4">
            @if(!isReadOnly) {
              <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="hwIdealForm.invalid" class="ucc-btn-primary">
                @if(isEditing) {
                  Actualizar
                } @else {
                  Agregar Plantilla
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
             <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'crear'}" type="button" (click)="descargarPlantilla()" class="flex items-center gap-2 px-4 py-2 bg-ucc-surface-container text-ucc-neutral-text rounded-md text-sm hover:bg-ucc-surface-container-high transition-colors">
               <span class="material-symbols-outlined text-[18px]">download</span> Plantilla Excel
             </button>
             <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'crear'}" type="button" (click)="fileInput.click()" class="flex items-center gap-2 px-4 py-2 bg-ucc-primary-container text-ucc-on-primary-container rounded-md text-sm hover:bg-ucc-primary/80 transition-colors">
               <span class="material-symbols-outlined text-[18px]">upload</span> Subir Excel
             </button>
             <input type="file" #fileInput (change)="cargarExcel($event)" accept=".xlsx" style="display: none;" />
          </div>
        </div>

        <table class="ucc-table">
          <thead>
            <tr>
              <th>Código Puesto</th>
              <th>Puesto Relacionado</th>
              <th>Equipo Base</th>
              <th>Procesador</th>
              <th>Marca</th>
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

              <!-- Puesto Relacionado -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroPuestoRel" (input)="aplicarFiltros()" (focus)="showFiltroP = true" (blur)="cerrarFiltroP()" placeholder="Buscar puesto..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroP) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroPuesto('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (p of puestosTablaFiltrados; track p) {
                      <li (mousedown)="seleccionarFiltroPuesto(p)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ p }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Equipo Base -->
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

              <!-- Procesador -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroProcesador" (input)="aplicarFiltros()" (focus)="showFiltroProc = true" (blur)="cerrarFiltroProc()" placeholder="Buscar procesador..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroProc) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroProcesador('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (pr of procesadoresTablaFiltrados; track pr) {
                      <li (mousedown)="seleccionarFiltroProcesador(pr)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pr }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Memoria -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroMemoria" (input)="aplicarFiltros()" (focus)="showFiltroMem = true" (blur)="cerrarFiltroMem()" placeholder="Buscar memoria..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroMem) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroMemoria('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (mem of memoriasTablaFiltradas; track mem) {
                      <li (mousedown)="seleccionarFiltroMemoria(mem)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ mem }}</li>
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
            @for(hw of paginatedList; track hw.id || hw.Id) {
              <tr>
                <td>{{hw.codigoPuesto || hw.CodigoPuesto}}</td> 
                <td>{{hw.nombrePuesto || hw.NombrePuesto || getPuestoName(hw.puestoId || hw.PuestoId)}}</td> 
                <td>{{ getTipoName(hw.tipoHardwareId || hw.TipoHardwareId, hw.tipoEquipo || hw.TipoEquipo) || 'N/A' }}</td> 
                <td>{{hw.procesador || hw.Procesador || 'N/A'}}</td> 
                <td>{{hw.marcaPC || hw.MarcaPC || 'N/A'}}</td>
                <td>
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'EDITAR'}" (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'ELIMINAR'}" (click)="delete(hw.id || hw.Id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
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
                        No hay hardware ideal registrado en el sistema.
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
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span class="material-symbols-outlined text-ucc-primary">assignment_turned_in</span>
                    Resultados de Importación
                </h3>
                <button (click)="cerrarImportModal()" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Body -->
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

                @if(importResult.errores && importResult.errores.length > 0) {
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

            <!-- Footer -->
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
export class HardwareIdealComponent implements OnInit {
  showImportModal = false;
  importResult: any = null;

  listaFiltradaTabla: any[] = [];

  showFiltroCodP = false;
  showFiltroP = false;
  showFiltroEq = false;
  showFiltroProc = false;
  showFiltroMem = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.equiposIdeales.map(e => e.codigoPuesto || e.CodigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.equiposIdeales.map(e => e.nombrePuesto || e.NombrePuesto || this.getPuestoName(e.puestoId || e.PuestoId)).filter((p): p is string => Boolean(p)))).sort();
  }

  get equiposUnicos(): string[] {
    return Array.from(new Set(this.equiposIdeales.map(e => this.getTipoName(e.tipoHardwareId || e.TipoHardwareId, e.tipoEquipo || e.TipoEquipo)).filter((eq): eq is string => Boolean(eq)))).sort();
  }

  get procesadoresUnicos(): string[] {
    return Array.from(new Set(this.equiposIdeales.map(e => e.procesador || e.Procesador).filter((pr): pr is string => Boolean(pr)))).sort();
  }

  get memoriasUnicas(): string[] {
    return Array.from(new Set(this.equiposIdeales.map(e => e.memoria || e.Memoria).filter((mem): mem is string => Boolean(mem)))).sort();
  }

  get codigosPuestoFiltrados() {
    return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
  }

  get puestosTablaFiltrados() {
    return this.puestosUnicos.filter(p => p.toLowerCase().includes(this.filtroPuestoRel.toLowerCase()));
  }

  get equiposTablaFiltrados() {
    return this.equiposUnicos.filter(eq => eq.toLowerCase().includes(this.filtroEquipo.toLowerCase()));
  }

  get procesadoresTablaFiltrados() {
    return this.procesadoresUnicos.filter(pr => pr.toLowerCase().includes(this.filtroProcesador.toLowerCase()));
  }

  get memoriasTablaFiltradas() {
    return this.memoriasUnicas.filter(mem => mem.toLowerCase().includes(this.filtroMemoria.toLowerCase()));
  }

  seleccionarFiltroCodigoPuesto(val: string) { this.filtroCodigoPuesto = val; this.showFiltroCodP = false; this.aplicarFiltros(); }
  seleccionarFiltroPuesto(val: string) { this.filtroPuestoRel = val; this.showFiltroP = false; this.aplicarFiltros(); }
  seleccionarFiltroEquipo(val: string) { this.filtroEquipo = val; this.showFiltroEq = false; this.aplicarFiltros(); }
  seleccionarFiltroProcesador(val: string) { this.filtroProcesador = val; this.showFiltroProc = false; this.aplicarFiltros(); }
  seleccionarFiltroMemoria(val: string) { this.filtroMemoria = val; this.showFiltroMem = false; this.aplicarFiltros(); }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroP() { setTimeout(() => this.showFiltroP = false, 200); }
  cerrarFiltroEq() { setTimeout(() => this.showFiltroEq = false, 200); }
  cerrarFiltroProc() { setTimeout(() => this.showFiltroProc = false, 200); }
  cerrarFiltroMem() { setTimeout(() => this.showFiltroMem = false, 200); }

  aplicarFiltros() {
    const dataList = this.equiposIdeales; 

    if (!dataList || dataList.length === 0) {
        this.listaFiltradaTabla = [];
        return;
    }

    this.listaFiltradaTabla = dataList.filter((item: any) => {
      const cod = item.codigoPuesto || item.CodigoPuesto || '';
      const pue = item.nombrePuesto || item.NombrePuesto || this.getPuestoName(item.puestoId || item.PuestoId) || '';
      const eq = this.getTipoName(item.tipoHardwareId || item.TipoHardwareId, item.tipoEquipo || item.TipoEquipo) || '';
      const proc = item.procesador || item.Procesador || '';
      const mem = item.memoria || item.Memoria || '';

      const matchCod = !this.filtroCodigoPuesto || cod.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase());
      const matchPue = !this.filtroPuestoRel || pue.toLowerCase().includes(this.filtroPuestoRel.toLowerCase());
      const matchEq = !this.filtroEquipo || eq.toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const matchProc = !this.filtroProcesador || proc.toLowerCase().includes(this.filtroProcesador.toLowerCase());
      const matchMem = !this.filtroMemoria || mem.toLowerCase().includes(this.filtroMemoria.toLowerCase());

      return matchCod && matchPue && matchEq && matchProc && matchMem;
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
      { field: 'nombrePuesto', placeholder: 'Puesto', type: 'text' },
      { field: 'tipoEquipo', placeholder: 'Tipo de Equipo', type: 'text' },
      { field: 'procesador', placeholder: 'Procesador', type: 'text' },
      { field: 'memoria', placeholder: 'Memoria', type: 'text' }
    ];
  }

  tiposHardware: Catalogo[] = [];
  selectedTipoHardwareId: number | null = null;
  
  getTipoName(tipoId: number | null | undefined, fallback: string): string {
    if (tipoId) {
      const tipo = this.tiposHardware.find(t => Number(t.id) === Number(tipoId));
      if (tipo) return tipo.nombre;
    }
    return fallback;
  }

  get isPC(): boolean {
    if (!this.selectedTipoHardwareId) return false;
    const tipo = this.tiposHardware.find(t => Number(t.id) === Number(this.selectedTipoHardwareId));
    if (!tipo) return false;
    const nombre = tipo.nombre.toLowerCase();
    return nombre.includes('laptop') || nombre.includes('desktop') || nombre.includes('computadora');
  }

  onTipoHardwareChangeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedTipoHardwareId = target.value ? Number(target.value) : null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
  }

  onTipoHardwareChange(tipoId: number | null, isEditing: boolean = false) {
    this.selectedTipoHardwareId = tipoId;
    const isPC = this.isPC;
    const form = this.hwIdealForm; 
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

  filtroCodigoPuesto: string = '';
  filtroPuestoRel: string = '';
  filtroEquipo: string = '';
  filtroProcesador: string = '';
  filtroMemoria: string = '';

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || row.CodigoPuesto || 'N/A',
      'PUESTO RELACIONADO': row.nombrePuesto || row.NombrePuesto || this.getPuestoName(row.puestoId || row.PuestoId),
      'EQUIPO BASE': this.getTipoName(row.tipoHardwareId || row.TipoHardwareId, row.tipoEquipo || row.TipoEquipo) || 'N/A',
      'PROCESADOR': row.procesador || row.Procesador || 'N/A',
      'MEMORIA': row.memoria || row.Memoria || 'N/A',
      'DISCO': row.disco || row.Disco || 'N/A',
      'OBSERVACIONES': row.otrasConsideraciones || row.OtrasConsideraciones || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 25}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, ws, 'Equipo Ideal');
    XLSX.writeFile(wb, `Reporte_Equipo_Ideal.xlsx`);
  }

  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPuestoRel = '';
    this.filtroEquipo = '';
    this.filtroProcesador = '';
    this.filtroMemoria = '';
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  equiposIdeales: any[] = [];
  puestos: any[] = [];
  hwIdealForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showDropdownPuestos = false;
  searchTermPuestos = '';

  get puestosFiltrados() {
    return this.puestos.filter(p => p.nombrePuesto.toLowerCase().includes(this.searchTermPuestos.toLowerCase()));
  }

  seleccionarPuesto(puesto: Puesto | null) {
    if (puesto) {
        this.hwIdealForm.patchValue({ puestoId: puesto.id });
        this.searchTermPuestos = puesto.nombrePuesto;
    } else {
        this.hwIdealForm.patchValue({ puestoId: null });
        this.searchTermPuestos = '';
    }
    this.showDropdownPuestos = false;
  }

  cerrarDropdownPuestos() {
    setTimeout(() => {
      this.showDropdownPuestos = false;
      const currentId = this.hwIdealForm.get('puestoId')?.value;
      if (!currentId) {
          this.searchTermPuestos = '';
      } else {
          const matched = this.puestos.find(p => Number(p.id) === Number(currentId));
          if (matched) this.searchTermPuestos = matched.nombrePuesto;
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
    this.hwIdealForm = this.fb.group({
      puestoId: [null, Validators.required],
      tipoHardwareId: [null, Validators.required],
      tipoEquipo: [''],
      procesador: ['', Validators.required],
      memoria: ['', Validators.required],
      disco: ['', Validators.required],
      marcaPC: ['', Validators.required],
      otrasConsideraciones: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.updateFilterConfig();
  }

  loadData() {
    this.api.getPuestos().subscribe({
      next: (res) => {
        this.puestos = res;
        this.api.getTiposHardware().subscribe(tipos => {
          this.tiposHardware = tipos;
          this.api.getHardwareIdeal().subscribe({
            next: (data) => {
              this.equiposIdeales = data;
              this.aplicarFiltros();
            },
            error: (err) => console.error('Error al cargar equipos ideales', err)
          });
        });
      }
    });
  }

  getPuestoName(puestoId: any): string {
    if (!puestoId) return 'N/A';
    const puesto = this.puestos.find(p => Number(p.id) === Number(puestoId));
    return puesto ? puesto.nombrePuesto : 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('EQUIPO_IDEAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('EQUIPO_IDEAL', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.hwIdealForm.markAllAsTouched();
    if (this.hwIdealForm.invalid) return;

    const data = this.hwIdealForm.value;
    data.puestoId = Number(data.puestoId);
    data.tipoHardwareId = this.selectedTipoHardwareId;
    data.tipoEquipo = this.getTipoName(this.selectedTipoHardwareId, data.tipoEquipo);

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareIdeal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar plantilla.')
      });
    } else {
      this.api.createHardwareIdeal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear plantilla.')
      });
    }
  }

  edit(hw: any) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = hw.id || hw.Id;
    this.hwIdealForm.enable();

    this.hwIdealForm.patchValue({
      puestoId: hw.puestoId || hw.PuestoId,
      tipoHardwareId: hw.tipoHardwareId || hw.TipoHardwareId,
      tipoEquipo: hw.tipoEquipo || hw.TipoEquipo,
      procesador: hw.procesador || hw.Procesador,
      memoria: hw.memoria || hw.Memoria,
      disco: hw.disco || hw.Disco,
      marcaPC: hw.marcaPC || hw.MarcaPC,
      otrasConsideraciones: hw.otrasConsideraciones || hw.OtrasConsideraciones
    });

    this.selectedTipoHardwareId = (hw.tipoHardwareId || hw.TipoHardwareId) || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId, true);
    
    const pId = hw.puestoId || hw.PuestoId;
    if (pId) {
        const matched = this.puestos.find(p => Number(p.id) === Number(pId));
        this.searchTermPuestos = matched ? matched.nombrePuesto : '';
    } else {
        this.searchTermPuestos = '';
    }
    this.showDropdownPuestos = false;
  }

  delete(id: any) {
    if (id === undefined || id === null) {
      alert('Error: No se puede identificar el registro a eliminar.');
      return;
    }

    if (!this.permissionService.tienePermiso('EQUIPO_IDEAL', 'ELIMINAR')) {
      alert('Acceso denegado.');
      return;
    }

    if(confirm('¿Está Seguro de que desea eliminar este equipo ideal?')) {
      this.api.deleteHardwareIdeal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }


  // MÉTODOS DE EXCEL
  descargarPlantilla() {
    this.api.descargarPlantillaHardwareIdeal().subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Plantilla_Hardware_Ideal.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

    cargarExcel(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.api.importarHardwareIdeal(file).subscribe({
        next: (res: any) => {
           this.importResult = res;
           this.showImportModal = true;
           this.loadData();
           event.target.value = '';
        },
        error: (err: any) => {
           this.importResult = err.error || { message: 'Error interno del servidor', totalExitosos: 0, totalFallidos: 0, errores: ['Error de conexión o validación.'] };
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

  verDetalle(hw: any) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id || hw.Id;
    
    this.hwIdealForm.patchValue({
      puestoId: hw.puestoId || hw.PuestoId,
      tipoHardwareId: hw.tipoHardwareId || hw.TipoHardwareId,
      tipoEquipo: hw.tipoEquipo || hw.TipoEquipo,
      procesador: hw.procesador || hw.Procesador, 
      memoria: hw.memoria || hw.Memoria,      
      disco: hw.disco || hw.Disco,
      marcaPC: hw.marcaPC || hw.MarcaPC,
      otrasConsideraciones: hw.otrasConsideraciones || hw.OtrasConsideraciones
    });

    this.selectedTipoHardwareId = (hw.tipoHardwareId || hw.TipoHardwareId) || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
    this.hwIdealForm.disable();

    const pId = hw.puestoId || hw.PuestoId;
    if (pId) {
        const matched = this.puestos.find(p => Number(p.id) === Number(pId));
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedTipoHardwareId = null;
    this.onTipoHardwareChange(null);
    this.hwIdealForm.reset({
      puestoId: null,
      tipoHardwareId: null,
      tipoEquipo: '',
      procesador: '',
      memoria: '',
      disco: '',
      marcaPC: '',
      otrasConsideraciones: ''
    });
    this.hwIdealForm.enable();
    this.searchTermPuestos = '';
  }
}