import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import { PermisosSitio, Empleado, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-sitios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Permisos por Sitio</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles de Permisos Sitio' : (isEditing ? 'Editar Permisos Sitio' : 'Registrar Permisos Sitio') }}</h3></div>
        <form [formGroup]="sitioForm" (ngSubmit)="onSubmit()" >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex flex-col">
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
                        (mousedown)="seleccionarEmpleado(emp)">{{emp.nombreCompleto}}</li>
                  } @empty {
                    <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                  }
                </ul>
              </div>
              @if(sitioForm.get('empleadoId')?.invalid && sitioForm.get('empleadoId')?.touched) {
                <span class="text-red-400 text-xs mt-1">El empleado es requerido.</span>
              }
              <span class="text-sm text-gray-400 mt-1">Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span>
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input type="text"
                       class="ucc-input w-full"
                       placeholder="Buscar o seleccionar sitio..."
                       [(ngModel)]="searchTermSitios"
                       [ngModelOptions]="{standalone: true}"
                       (focus)="showDropdownSitios = true"
                       (blur)="cerrarDropdownSitios()"
                       [disabled]="isReadOnly">
                <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                    [hidden]="!showDropdownSitios || isReadOnly">
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarSitio(null)">Ninguno</li>
                  @for(sitio of sitiosFiltrados; track sitio.id) {
                    <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                        (mousedown)="seleccionarSitio(sitio)">{{sitio.nombre}}</li>
                  } @empty {
                    <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                  }
                </ul>
              </div>
              @if(sitioForm.get('sitio')?.invalid && sitioForm.get('sitio')?.touched) {
                <span class="text-red-400 text-xs mt-1">El sitio es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input type="text"
                       class="ucc-input w-full"
                       placeholder="Buscar o seleccionar ambiente..."
                       [(ngModel)]="searchTermAmbientes"
                       [ngModelOptions]="{standalone: true}"
                       (focus)="showDropdownAmbientes = true"
                       (blur)="cerrarDropdownAmbientes()"
                       [disabled]="isReadOnly">
                <ul class="absolute z-50 w-full mt-1 bg-ucc-surface border border-ucc-neutral-outline/30 rounded-lg shadow-ucc-card max-h-60 overflow-y-auto"
                    [hidden]="!showDropdownAmbientes || isReadOnly">
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (mousedown)="seleccionarAmbiente(null)">Ninguno</li>
                  @for(amb of ambientesFiltrados; track amb.id) {
                    <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                        (mousedown)="seleccionarAmbiente(amb)">{{amb.nombre}}</li>
                  } @empty {
                    <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                  }
                </ul>
              </div>
              @if(sitioForm.get('ambiente')?.invalid && sitioForm.get('ambiente')?.touched) {
                <span class="text-red-400 text-xs mt-1">El ambiente es requerido.</span>
              }
            </div>

            <div class="flex flex-col lg:col-span-3">
              <label class="ucc-label">Grupos de Permisos (ej. Soporte-Consulta)</label>
              <input formControlName="gruposPermisos" placeholder="Grupos de Permisos (ej. Soporte-Consulta)" class="ucc-input">
              @if(sitioForm.get('gruposPermisos')?.invalid && sitioForm.get('gruposPermisos')?.touched) {
                <span class="text-red-400 text-xs mt-1">Los grupos son requeridos.</span>
              }
            </div>
          </div>

          <div class="mt-4">
            @if(!isReadOnly) {
              <button *appPermiso="{pantalla: 'PERMISOS_SITIOS', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="sitioForm.invalid" class="ucc-btn-primary">
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
        </div>

        <table class="ucc-table">
          <thead>
            <tr>
              <th>Código Puesto</th>
              <th>Persona</th>
              <th>Puesto</th>
              <th>Sitio</th>
              <th>Ambiente</th>
              <th>Grupos Permisos</th>
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

              <!-- Persona -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroPersona" (input)="aplicarFiltros()" (focus)="showFiltroPers = true" (blur)="cerrarFiltroPers()" placeholder="Buscar persona..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroPers) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroPersona('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (pers of personasFiltradas; track pers) {
                      <li (mousedown)="seleccionarFiltroPersona(pers)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pers }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Puesto -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroPuesto" (input)="aplicarFiltros()" (focus)="showFiltroPue = true" (blur)="cerrarFiltroPue()" placeholder="Buscar puesto..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroPue) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroPuesto('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (pue of puestosFiltradosTabla; track pue) {
                      <li (mousedown)="seleccionarFiltroPuesto(pue)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pue }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Sitio -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroSitio" (input)="aplicarFiltros()" (focus)="showFiltroSit = true" (blur)="cerrarFiltroSit()" placeholder="Buscar sitio..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroSit) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroSitio('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (sit of sitiosFiltroTabla; track sit) {
                      <li (mousedown)="seleccionarFiltroSitio(sit)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ sit }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Ambiente -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroAmbiente" (input)="aplicarFiltros()" (focus)="showFiltroAmb = true" (blur)="cerrarFiltroAmb()" placeholder="Buscar ambiente..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroAmb) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroAmbiente('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (amb of ambientesFiltroTabla; track amb) {
                      <li (mousedown)="seleccionarFiltroAmbiente(amb)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ amb }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Grupos Permisos -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtroGrupos" (input)="aplicarFiltros()" (focus)="showFiltroGrup = true" (blur)="cerrarFiltroGrup()" placeholder="Buscar grupos..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroGrup) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroGrupos('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (grup of gruposFiltroTabla; track grup) {
                      <li (mousedown)="seleccionarFiltroGrupos(grup)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ grup }}</li>
                    }
                  </ul>
                }
              </td>

              <td class="p-3 text-center">
                <div class="flex justify-center">
                  <div class="flex flex-col gap-1">
                    <button (click)="exportarReporte()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors"><span class="material-symbols-outlined text-[16px]">download</span> Exportar</button>
                    <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors"><span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar</button>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            @for(sitio of paginatedList; track sitio.id) {
              <tr>
                <td>{{ sitio.codigoPuesto }}</td>
                <td>{{ sitio.nombreCompleto }}</td>
                <td>{{ sitio.nombrePuesto }}</td>
                <td>{{ sitio.sitio }}</td>
                <td>{{ sitio.ambiente }}</td>
                <td>{{ sitio.gruposPermisos }}</td>
                <td>
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(sitio)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button *appPermiso="{pantalla: 'PERMISOS_SITIOS', accion: 'EDITAR'}" (click)="edit(sitio)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button *appPermiso="{pantalla: 'PERMISOS_SITIOS', accion: 'ELIMINAR'}" (click)="delete(sitio.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
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
                        No hay sitios registrados en el sistema.
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
export class SitiosComponent implements OnInit {
  sitiosCat: any[] = [];
  ambientes: any[] = [];
  listaFiltradaTabla: any[] = [];

  showFiltroCodP = false;
  showFiltroPers = false;
  showFiltroPue = false;
  showFiltroSit = false;
  showFiltroAmb = false;
  showFiltroGrup = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get personasUnicas(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.nombreCompleto).filter((p): p is string => Boolean(p)))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.nombrePuesto).filter((p): p is string => Boolean(p)))).sort();
  }

  get sitiosUnicos(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.sitio).filter((s): s is string => Boolean(s)))).sort();
  }

  get ambientesUnicos(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.ambiente).filter((a): a is string => Boolean(a)))).sort();
  }

  get gruposUnicos(): string[] {
    return Array.from(new Set(this.permisosSitios.map(s => s.gruposPermisos).filter((g): g is string => Boolean(g)))).sort();
  }

  get codigosPuestoFiltrados() {
    return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
  }

  get personasFiltradas() {
    return this.personasUnicas.filter(p => p.toLowerCase().includes(this.filtroPersona.toLowerCase()));
  }

  get puestosFiltradosTabla() {
    return this.puestosUnicos.filter(p => p.toLowerCase().includes(this.filtroPuesto.toLowerCase()));
  }

  get sitiosFiltroTabla() {
    return this.sitiosUnicos.filter(s => s.toLowerCase().includes(this.filtroSitio.toLowerCase()));
  }

  get ambientesFiltroTabla() {
    return this.ambientesUnicos.filter(a => a.toLowerCase().includes(this.filtroAmbiente.toLowerCase()));
  }

  get gruposFiltroTabla() {
    return this.gruposUnicos.filter(g => g.toLowerCase().includes(this.filtroGrupos.toLowerCase()));
  }

  seleccionarFiltroCodigoPuesto(val: string) { this.filtroCodigoPuesto = val; this.showFiltroCodP = false; this.aplicarFiltros(); }
  seleccionarFiltroPersona(val: string) { this.filtroPersona = val; this.showFiltroPers = false; this.aplicarFiltros(); }
  seleccionarFiltroPuesto(val: string) { this.filtroPuesto = val; this.showFiltroPue = false; this.aplicarFiltros(); }
  seleccionarFiltroSitio(val: string) { this.filtroSitio = val; this.showFiltroSit = false; this.aplicarFiltros(); }
  seleccionarFiltroAmbiente(val: string) { this.filtroAmbiente = val; this.showFiltroAmb = false; this.aplicarFiltros(); }
  seleccionarFiltroGrupos(val: string) { this.filtroGrupos = val; this.showFiltroGrup = false; this.aplicarFiltros(); }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroPers() { setTimeout(() => this.showFiltroPers = false, 200); }
  cerrarFiltroPue() { setTimeout(() => this.showFiltroPue = false, 200); }
  cerrarFiltroSit() { setTimeout(() => this.showFiltroSit = false, 200); }
  cerrarFiltroAmb() { setTimeout(() => this.showFiltroAmb = false, 200); }
  cerrarFiltroGrup() { setTimeout(() => this.showFiltroGrup = false, 200); }

  aplicarFiltros() {
    if (!this.permisosSitios) return;

    this.listaFiltradaTabla = this.permisosSitios.filter((item: any) => {
      const matchCod = !this.filtroCodigoPuesto || (item.codigoPuesto && item.codigoPuesto.toLowerCase().includes(this.filtroCodigoPuesto.toLowerCase()));
      const matchPersona = !this.filtroPersona || (item.nombreCompleto && item.nombreCompleto.toLowerCase().includes(this.filtroPersona.toLowerCase()));
      const matchPuesto = !this.filtroPuesto || (item.nombrePuesto && item.nombrePuesto.toLowerCase().includes(this.filtroPuesto.toLowerCase()));
      const matchSitio = !this.filtroSitio || (item.sitio && item.sitio.toLowerCase().includes(this.filtroSitio.toLowerCase()));
      const matchAmbiente = !this.filtroAmbiente || (item.ambiente && item.ambiente.toLowerCase().includes(this.filtroAmbiente.toLowerCase()));
      const matchGrupos = !this.filtroGrupos || (item.gruposPermisos && item.gruposPermisos.toLowerCase().includes(this.filtroGrupos.toLowerCase()));
      
      return matchCod && matchPersona && matchPuesto && matchSitio && matchAmbiente && matchGrupos;
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
      { field: 'sitio', placeholder: 'Sitio', type: 'select', options: this.sitiosCat, optionValueKey: 'nombre', optionLabelKey: 'nombre' },
      { field: 'ambiente', placeholder: 'Ambiente', type: 'select', options: this.ambientes, optionValueKey: 'nombre', optionLabelKey: 'nombre' },
      { field: 'gruposPermisos', placeholder: 'Grupos/Permisos', type: 'text' }
    ];
  }

  // Filtros de Tabla
  filtroCodigoPuesto: string = '';
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroSitio: string = '';
  filtroAmbiente: string = '';
  filtroGrupos: string = '';

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      'PERSONA': row.nombreCompleto || 'N/A',
      'PUESTO': row.nombrePuesto || 'N/A',
      'SITIO': row.sitio || 'N/A',
      'AMBIENTE': row.ambiente || 'N/A',
      'GRUPOS PERMISOS': row.gruposPermisos || 'N/A',
      'OBSERVACIONES': row.observaciones || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 35}, {wch: 25}, {wch: 20}, {wch: 35}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, ws, 'Permisos Sitios');
    XLSX.writeFile(wb, `Reporte_Permisos_Sitios.xlsx`);
  }

  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroSitio = '';
    this.filtroAmbiente = '';
    this.filtroGrupos = '';
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  permisosSitios: PermisosSitio[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  sitioForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showDropdownEmpleados = false;
  searchTermEmpleados = '';

  get empleadosFiltrados() {
    return this.empleados.filter(e => e.nombreCompleto.toLowerCase().includes(this.searchTermEmpleados.toLowerCase()));
  }

  seleccionarEmpleado(empleado: Empleado | null) {
    if (empleado) {
        this.sitioForm.patchValue({ empleadoId: empleado.id });
        this.searchTermEmpleados = empleado.nombreCompleto;
    } else {
        this.sitioForm.patchValue({ empleadoId: null });
        this.searchTermEmpleados = '';
    }
    this.showDropdownEmpleados = false;
    this.onEmpleadoChange(null);
  }

  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.sitioForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEmpleados = '';
      } else {
          const matched = this.empleados.find(e => e.id === currentId);
          if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }

  showDropdownSitios = false;
  searchTermSitios = '';

  get sitiosFiltrados() {
    return this.sitiosOpciones.filter(s => s.nombre.toLowerCase().includes(this.searchTermSitios.toLowerCase()));
  }

  seleccionarSitio(sitio: Catalogo | null) {
    if (sitio) {
        this.sitioForm.patchValue({ sitio: sitio.nombre });
        this.searchTermSitios = sitio.nombre;
    } else {
        this.sitioForm.patchValue({ sitio: null });
        this.searchTermSitios = '';
    }
    this.showDropdownSitios = false;
  }

  cerrarDropdownSitios() {
    setTimeout(() => {
      this.showDropdownSitios = false;
      const currentVal = this.sitioForm.get('sitio')?.value;
      if (!currentVal) {
          this.searchTermSitios = '';
      } else {
          const matched = this.sitiosOpciones.find(s => s.nombre === currentVal);
          if (matched) this.searchTermSitios = matched.nombre;
      }
    }, 200);
  }

  showDropdownAmbientes = false;
  searchTermAmbientes = '';

  get ambientesFiltrados() {
    return this.ambientesOpciones.filter(a => a.nombre.toLowerCase().includes(this.searchTermAmbientes.toLowerCase()));
  }

  seleccionarAmbiente(ambiente: Catalogo | null) {
    if (ambiente) {
        this.sitioForm.patchValue({ ambiente: ambiente.nombre });
        this.searchTermAmbientes = ambiente.nombre;
    } else {
        this.sitioForm.patchValue({ ambiente: null });
        this.searchTermAmbientes = '';
    }
    this.showDropdownAmbientes = false;
  }

  cerrarDropdownAmbientes() {
    setTimeout(() => {
      this.showDropdownAmbientes = false;
      const currentVal = this.sitioForm.get('ambiente')?.value;
      if (!currentVal) {
          this.searchTermAmbientes = '';
      } else {
          const matched = this.ambientesOpciones.find(a => a.nombre === currentVal);
          if (matched) this.searchTermAmbientes = matched.nombre;
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

  ambientesOpciones: Catalogo[] = [];
  sitiosOpciones: Catalogo[] = [];

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.sitioForm = this.fb.group({
      empleadoId: [null, Validators.required],
      sitio: ['', Validators.required],
      ambiente: ['', Validators.required],
      gruposPermisos: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.updateFilterConfig();
  }

  loadData() {
    this.api.getPermisosSitios().subscribe({
      next: (res: any[]) => {
        this.permisosSitios = res.map(item => ({
          id: item.id || item.Id,
          empleadoId: item.empleadoId || item.EmpleadoId,
          codigoPuesto: item.codigoPuesto || item.CodigoPuesto || 'N/A',
          nombrePuesto: item.nombrePuesto || item.NombrePuesto || 'N/A',
          nombreCompleto: item.nombreCompleto || item.NombreCompleto || 'Desconocido',
          sitio: item.sitio || item.Sitio || '',
          ambiente: item.ambiente || item.Ambiente || '',
          gruposPermisos: item.gruposPermisos || item.GruposPermisos || ''
        }));
        
        this.listaFiltradaTabla = [...this.permisosSitios];
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error:', err)
    });

    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
    this.api.getAmbientes().subscribe(res => this.ambientesOpciones = res);
    this.api.getSitiosCat().subscribe(res => this.sitiosOpciones = res);
  }

  onEmpleadoChange(event: any) {
    const empId = this.sitioForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find(e => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getEmpleadoName(id: number): string {
    return this.empleados.find(e => e.id === id)?.nombreCompleto || 'Desconocido';
  }

  getPuestoByEmpleado(empleadoId: number): string {
    const emp = this.empleados.find(e => e.id === empleadoId);
    if (!emp || !emp.puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === emp.puestoId)?.nombrePuesto || 'Desconocido';
  }

  getPuestoName(puestoId: number | undefined | null): string {
    if (!puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('PERMISOS_SITIOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('PERMISOS_SITIOS', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.sitioForm.markAllAsTouched();
    if (this.sitioForm.invalid) return;

    const data = this.sitioForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updatePermisosSitio(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar permisos de sitio.')
      });
    } else {
      this.api.createPermisosSitio(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear permisos de sitio.')
      });
    }
  }

  edit(sitio: PermisosSitio) {
    if (!this.permissionService.tienePermiso('PERMISOS_SITIOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sitio.id;
    this.sitioForm.enable();
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null);
    if (sitio.empleadoId) {
        const matched = this.empleados.find(e => e.id === sitio.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermSitios = sitio.sitio || '';
    this.searchTermAmbientes = sitio.ambiente || '';
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('PERMISOS_SITIOS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está seguro de que desea eliminar este permiso?')) {
      this.api.deletePermisosSitio(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(sitio: PermisosSitio) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sitio.id;
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null);
    this.sitioForm.disable();
    if (sitio.empleadoId) {
        const matched = this.empleados.find(e => e.id === sitio.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermSitios = sitio.sitio || '';
    this.searchTermAmbientes = sitio.ambiente || '';
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.sitioForm.reset({
      empleadoId: null,
      sitio: '',
      ambiente: '',
      gruposPermisos: ''
    });
    this.sitioForm.enable();
    this.searchTermEmpleados = '';
    this.searchTermSitios = '';
    this.searchTermAmbientes = '';
  }
}