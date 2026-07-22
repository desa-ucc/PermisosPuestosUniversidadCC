import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { PermissionService } from '../../services/permission.service';
import {
  AccesoBD,
  Empleado,
  Puesto,
  CatalogoNivelAcceso,
} from '../../models/models';

@Component({
  selector: 'app-base-datos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PermisoDirective,
  ],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">
          Base de Datos
        </h2>
        <p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">
          Gestión administrativa de los registros y asignaciones.
        </p>
      </div>

      <section class="ucc-card mb-8">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">edit_document</span>
          <h3 class="text-xl font-bold">
            {{
              isReadOnly
                ? 'Detalles de Base de Datos'
                : isEditing
                  ? 'Editar Base de Datos'
                  : 'Registrar Base de Datos'
            }}
          </h3>
        </div>
        <form [formGroup]="accesoBDForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input
                  type="text"
                  class="ucc-input w-full"
                  placeholder="Buscar o seleccionar empleado..."
                  [(ngModel)]="searchTermEmpleados"
                  [ngModelOptions]="{ standalone: true }"
                  (focus)="showDropdownEmpleados = true"
                  (blur)="cerrarDropdownEmpleados()"
                  [disabled]="isReadOnly"
                />
                @if (showDropdownEmpleados && !isReadOnly) {
                  <ul
                    class="absolute z-10 w-full mt-1 bg-white border border-ucc-neutral-outline/50 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <li
                      (mousedown)="seleccionarEmpleado(null)"
                      class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic"
                    >
                      -- Limpiar selección --
                    </li>
                    @for (emp of empleadosFiltrados; track emp.id) {
                      <li
                        (mousedown)="seleccionarEmpleado(emp)"
                        class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral"
                      >
                        {{ emp.nombreCompleto }}
                      </li>
                    }
                  </ul>
                }
              </div>
              @if (selectedEmpleadoPuestoId) {
                <span
                  class="text-xs text-ucc-neutral-variant mt-1 ml-1 font-semibold"
                  >Puesto: {{ getPuestoName(selectedEmpleadoPuestoId) }}</span
                >
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Servidor</label>
              <input
                formControlName="servidor"
                type="text"
                class="ucc-input"
                placeholder="Servidor IP/Nombre"
              />
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Base de Datos</label>
              <input
                formControlName="baseDatos"
                type="text"
                class="ucc-input"
                placeholder="Nombre BD"
              />
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Nivel de Acceso</label>
              <div class="relative">
                <input
                  type="text"
                  class="ucc-input w-full"
                  placeholder="Buscar o seleccionar nivel..."
                  [(ngModel)]="searchTermNiveles"
                  [ngModelOptions]="{ standalone: true }"
                  (focus)="showDropdownNiveles = true"
                  (blur)="cerrarDropdownNiveles()"
                  [disabled]="isReadOnly"
                />
                @if (showDropdownNiveles && !isReadOnly) {
                  <ul
                    class="absolute z-10 w-full mt-1 bg-white border border-ucc-neutral-outline/50 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <li
                      (mousedown)="seleccionarNivel(null)"
                      class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic"
                    >
                      -- Limpiar selección --
                    </li>
                    @for (nivel of nivelesFiltrados; track nivel.id) {
                      <li
                        (mousedown)="seleccionarNivel(nivel)"
                        class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral"
                      >
                        {{ nivel.nombre }}
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Observaciones</label>
              <input
                formControlName="observaciones"
                type="text"
                class="ucc-input"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div class="mt-6 flex gap-3 justify-end">
            @if (!isReadOnly) {
              <button
                type="submit"
                [disabled]="accesoBDForm.invalid"
                class="ucc-btn-primary"
              >
                <span class="material-symbols-outlined text-[20px]">{{
                  isEditing ? 'save' : 'add_circle'
                }}</span>
                {{ isEditing ? 'Actualizar' : 'Agregar' }}
              </button>
            }
            @if (isEditing || isReadOnly) {
              <button
                type="button"
                (click)="resetForm()"
                class="ucc-btn-secondary"
              >
                <span class="material-symbols-outlined text-[20px]"
                  >cancel</span
                >
                Cancelar
              </button>
            }
          </div>
        </form>
      </section>

      <!-- CONTENEDOR ESTÁNDAR UNIFICADO -->
      <section class="ucc-table-container">
        <div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/25 bg-ucc-secondary" style="background-color: #356575;">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">database</span> Registros de Base de Datos
          </h3>
        </div>

        <table class="ucc-table">
          <thead>
            <tr>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Código Puesto</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Persona</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Puesto</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Servidor</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Base de Datos</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Nivel Acceso</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Observaciones</th>
              <th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center w-32">Acciones</th>
            </tr>

            <!-- FILA DE FILTROS TIPO COMBOBOX BUSCABLE AMPLIOS Y ESTILIZADOS -->
            <tr class="bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20">
              <!-- Código Puesto -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['codigoPuesto']" (input)="aplicarFiltros()" (focus)="showFiltroCodP = true" (blur)="cerrarFiltroCodP()" placeholder="Buscar cód..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroCodP) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('codigoPuesto', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (c of codigosPuestoFiltradosTabla; track c) {
                      <li (mousedown)="seleccionarFiltroCombobox('codigoPuesto', c)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ c }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Persona -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['nombreCompleto']" (input)="aplicarFiltros()" (focus)="showFiltroPers = true" (blur)="cerrarFiltroPers()" placeholder="Buscar persona..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroPers) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('nombreCompleto', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (p of personasFiltradasTabla; track p) {
                      <li (mousedown)="seleccionarFiltroCombobox('nombreCompleto', p)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ p }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Puesto -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['nombrePuesto']" (input)="aplicarFiltros()" (focus)="showFiltroPue = true" (blur)="cerrarFiltroPue()" placeholder="Buscar puesto..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroPue) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('nombrePuesto', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (p of puestosFiltradosTabla; track p) {
                      <li (mousedown)="seleccionarFiltroCombobox('nombrePuesto', p)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ p }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Servidor -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['servidor']" (input)="aplicarFiltros()" (focus)="showFiltroServ = true" (blur)="cerrarFiltroServ()" placeholder="Buscar servidor..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroServ) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('servidor', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (s of servidoresFiltradosTabla; track s) {
                      <li (mousedown)="seleccionarFiltroCombobox('servidor', s)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ s }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Base de Datos -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['baseDatos']" (input)="aplicarFiltros()" (focus)="showFiltroBD = true" (blur)="cerrarFiltroBD()" placeholder="Buscar BD..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroBD) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('baseDatos', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (bd of baseDatosFiltradasTabla; track bd) {
                      <li (mousedown)="seleccionarFiltroCombobox('baseDatos', bd)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ bd }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Nivel Acceso -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['nivelAcceso']" (input)="aplicarFiltros()" (focus)="showFiltroNiv = true" (blur)="cerrarFiltroNiv()" placeholder="Buscar nivel..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroNiv) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('nivelAcceso', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (n of nivelesTablaFiltrados; track n) {
                      <li (mousedown)="seleccionarFiltroCombobox('nivelAcceso', n)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ n }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Observaciones -->
              <td class="p-3 relative">
                <input type="text" [(ngModel)]="filtros['observaciones']" (input)="aplicarFiltros()" (focus)="showFiltroObs = true" (blur)="cerrarFiltroObs()" placeholder="Buscar obs..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroObs) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCombobox('observaciones', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                    @for (obs of observacionesFiltradasTabla; track obs) {
                      <li (mousedown)="seleccionarFiltroCombobox('observaciones', obs)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ obs }}</li>
                    }
                  </ul>
                }
              </td>

              <td class="p-3 text-center">
                <div class="flex justify-center">
                  <div class="flex flex-col gap-1">
                    <button (click)="exportarReporte()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                      <span class="material-symbols-outlined text-[16px]">download</span> Exportar
                    </button>
                    <button (click)="limpiarFiltros()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                      <span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            @for (acbd of paginatedList; track acbd.id) {
              <tr>
                <td class="py-4 px-6 font-body-md text-body-md font-bold">
                  {{ acbd.codigoPuesto || 'N/A' }}
                </td>
                <td class="py-4 px-6 font-body-md text-body-md">
                  {{ acbd.nombreCompleto || 'Desconocido' }}
                </td>
                <td class="py-4 px-6 font-body-md text-body-md">
                  {{ acbd.nombrePuesto || 'No Asignado' }}
                </td>
                <td class="py-4 px-6 font-body-md text-body-md">
                  {{ acbd.servidor }}
                </td>
                <td class="py-4 px-6 font-body-md text-body-md">
                  {{ acbd.baseDatos }}
                </td>
                <td class="py-4 px-6 font-body-md text-body-md">
                  <span
                    class="px-2 py-1 bg-ucc-primary/10 text-ucc-primary rounded-full text-xs font-semibold"
                    >{{ acbd.nivelAcceso }}</span
                  >
                </td>
                <td
                  class="py-4 px-6 font-body-md text-body-md text-on-surface-variant truncate max-w-xs"
                >
                  {{ acbd.observaciones }}
                </td>
                <td class="py-4 px-6">
                  <div class="flex justify-center gap-3">
                    <button
                      (click)="verDetalle(acbd)"
                      *appPermiso="{
                        pantalla: 'ADMINBASEDATOS',
                        accion: 'VER',
                      }"
                      class="p-2 text-ucc-primary hover:bg-ucc-primary/10 rounded-full transition-all tooltip-trigger"
                      title="Ver Detalle"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >visibility</span
                      >
                    </button>
                    <button
                      (click)="edit(acbd)"
                      *appPermiso="{
                        pantalla: 'ADMINBASEDATOS',
                        accion: 'EDITAR',
                      }"
                      class="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-all tooltip-trigger"
                      title="Editar"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >edit</span
                      >
                    </button>
                    <button
                      (click)="delete(acbd.id, acbd.nivelAcceso)"
                      *appPermiso="{
                        pantalla: 'ADMINBASEDATOS',
                        accion: 'ELIMINAR',
                      }"

class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all tooltip-trigger"

                      title="Eliminar"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >delete</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (paginatedList.length === 0) {
              <tr>
                <td
                  colspan="8"
                  class="text-center py-12 text-ucc-neutral-variant"
                >
                  <div class="flex flex-col items-center gap-3">
                    <span
                      class="material-symbols-outlined text-[48px] opacity-50"
                      >database</span
                    >
                    <p class="font-medium">
                      No hay registros de bases de datos.
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- FOOTER PAGINACIÓN -->
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
  `,
})
export class BaseDatosComponent implements OnInit {




  Math = Math;
  accesosBD: AccesoBD[] = [];
  listaFiltradaTabla: AccesoBD[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];

  accesoBDForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showFiltroCodP = false;
  showFiltroPers = false;
  showFiltroPue = false;
  showFiltroServ = false;
  showFiltroBD = false;
  showFiltroNiv = false;
  showFiltroObs = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get personasUnicas(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.nombreCompleto).filter((p): p is string => Boolean(p)))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.nombrePuesto).filter((pu): pu is string => Boolean(pu)))).sort();
  }

  get servidoresUnicos(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.servidor).filter((s): s is string => Boolean(s)))).sort();
  }

  get baseDatosUnicas(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.baseDatos).filter((bd): bd is string => Boolean(bd)))).sort();
  }

  get nivelesUnicos(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.nivelAcceso).filter((n): n is string => Boolean(n)))).sort();
  }

  get observacionesUnicas(): string[] {
    return Array.from(new Set(this.accesosBD.map(a => a.observaciones).filter((o): o is string => Boolean(o)))).sort();
  }

  get codigosPuestoFiltradosTabla() { return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes((this.filtros['codigoPuesto'] || '').toLowerCase())); }
  get personasFiltradasTabla() { return this.personasUnicas.filter(p => p.toLowerCase().includes((this.filtros['nombreCompleto'] || '').toLowerCase())); }
  get puestosFiltradosTabla() { return this.puestosUnicos.filter(pu => pu.toLowerCase().includes((this.filtros['nombrePuesto'] || '').toLowerCase())); }
  get servidoresFiltradosTabla() { return this.servidoresUnicos.filter(s => s.toLowerCase().includes((this.filtros['servidor'] || '').toLowerCase())); }
  get baseDatosFiltradasTabla() { return this.baseDatosUnicas.filter(bd => bd.toLowerCase().includes((this.filtros['baseDatos'] || '').toLowerCase())); }
  get nivelesTablaFiltrados() { return this.nivelesUnicos.filter(n => n.toLowerCase().includes((this.filtros['nivelAcceso'] || '').toLowerCase())); }
  get observacionesFiltradasTabla() { return this.observacionesUnicas.filter(o => o.toLowerCase().includes((this.filtros['observaciones'] || '').toLowerCase())); }

  seleccionarFiltroCombobox(key: string, val: string) {
    this.filtros[key] = val;
    this.showFiltroCodP = false;
    this.showFiltroPers = false;
    this.showFiltroPue = false;
    this.showFiltroServ = false;
    this.showFiltroBD = false;
    this.showFiltroNiv = false;
    this.showFiltroObs = false;
    this.aplicarFiltros();
  }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroPers() { setTimeout(() => this.showFiltroPers = false, 200); }
  cerrarFiltroPue() { setTimeout(() => this.showFiltroPue = false, 200); }
  cerrarFiltroServ() { setTimeout(() => this.showFiltroServ = false, 200); }
  cerrarFiltroBD() { setTimeout(() => this.showFiltroBD = false, 200); }
  cerrarFiltroNiv() { setTimeout(() => this.showFiltroNiv = false, 200); }
  cerrarFiltroObs() { setTimeout(() => this.showFiltroObs = false, 200); }

  filtros: { [key: string]: any } = {
    codigoPuesto: '',
    nombreCompleto: '',
    nombrePuesto: '',
    servidor: '',
    baseDatos: '',
    nivelAcceso: '',
    observaciones: '',
  };

  aplicarFiltros() {
    this.listaFiltradaTabla = this.accesosBD.filter((acbd) => {
      const matchCodigoPuesto =
        !this.filtros['codigoPuesto'] ||
        (acbd.codigoPuesto &&
          acbd.codigoPuesto
            .toLowerCase()
            .includes(this.filtros['codigoPuesto'].toLowerCase()));
      const matchNombreCompleto =
        !this.filtros['nombreCompleto'] ||
        (acbd.nombreCompleto &&
          acbd.nombreCompleto
            .toLowerCase()
            .includes(this.filtros['nombreCompleto'].toLowerCase()));
      const matchNombrePuesto =
        !this.filtros['nombrePuesto'] ||
        (acbd.nombrePuesto &&
          acbd.nombrePuesto
            .toLowerCase()
            .includes(this.filtros['nombrePuesto'].toLowerCase()));
      const matchServidor =
        !this.filtros['servidor'] ||
        (acbd.servidor &&
          acbd.servidor
            .toLowerCase()
            .includes(this.filtros['servidor'].toLowerCase()));
      const matchBaseDatos =
        !this.filtros['baseDatos'] ||
        (acbd.baseDatos &&
          acbd.baseDatos
            .toLowerCase()
            .includes(this.filtros['baseDatos'].toLowerCase()));
      const matchNivelAcceso =
        !this.filtros['nivelAcceso'] ||
        (acbd.nivelAcceso &&
          acbd.nivelAcceso
            .toLowerCase()
            .includes(this.filtros['nivelAcceso'].toLowerCase()));
      const matchObservaciones =
        !this.filtros['observaciones'] ||
        (acbd.observaciones &&
          acbd.observaciones
            .toLowerCase()
            .includes(this.filtros['observaciones'].toLowerCase()));

      return (
        matchCodigoPuesto &&
        matchNombreCompleto &&
        matchNombrePuesto &&
        matchServidor &&
        matchBaseDatos &&
        matchNivelAcceso &&
        matchObservaciones
      );
    });
    this.currentPage = 1;
  }

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      PERSONA: row.nombreCompleto || 'N/A',
      PUESTO: row.nombrePuesto || 'N/A',
      SERVIDOR: row.servidor || 'N/A',
      'BASE DE DATOS': row.baseDatos || 'N/A',
      'NIVEL DE ACCESO': row.nivelAcceso || 'N/A',
      OBSERVACIONES: row.observaciones || 'N/A',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 35 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Base de Datos');
    XLSX.writeFile(wb, `Reporte_BaseDatos.xlsx`);
  }

  limpiarFiltros() {
    this.filtros = {
      codigoPuesto: '',
      nombreCompleto: '',
      nombrePuesto: '',
      servidor: '',
      baseDatos: '',
      nivelAcceso: '',
      observaciones: '',
    };
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  // Empleados dropdown
  showDropdownEmpleados = false;
  searchTermEmpleados = '';
  get empleadosFiltrados() {
    return this.empleados.filter((e) =>
      e.nombreCompleto
        .toLowerCase()
        .includes(this.searchTermEmpleados.toLowerCase()),
    );
  }
  seleccionarEmpleado(emp: Empleado | null) {
    if (emp) {
      this.accesoBDForm.patchValue({ empleadoId: emp.id });
      this.searchTermEmpleados = emp.nombreCompleto;
    } else {
      this.accesoBDForm.patchValue({ empleadoId: null });
      this.searchTermEmpleados = '';
    }
    this.onEmpleadoChange(null);
    this.showDropdownEmpleados = false;
  }
  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.accesoBDForm.get('empleadoId')?.value;
      if (!currentId) {
        this.searchTermEmpleados = '';
      } else {
        const matched = this.empleados.find((e) => e.id === currentId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }

  // Niveles dropdown
  showDropdownNiveles = false;
  searchTermNiveles = '';
  get nivelesFiltrados() {
    return this.nivelesAcceso.filter((n) =>
      n.nombre.toLowerCase().includes(this.searchTermNiveles.toLowerCase()),
    );
  }
  seleccionarNivel(nivel: CatalogoNivelAcceso | null) {
    if (nivel) {
      this.accesoBDForm.patchValue({ nivelAcceso: nivel.nombre });
      this.searchTermNiveles = nivel.nombre;
    } else {
      this.accesoBDForm.patchValue({ nivelAcceso: null });
      this.searchTermNiveles = '';
    }
    this.showDropdownNiveles = false;
  }
  cerrarDropdownNiveles() {
    setTimeout(() => {
      this.showDropdownNiveles = false;
      const currentId = this.accesoBDForm.get('nivelAcceso')?.value;
      if (!currentId) {
        this.searchTermNiveles = '';
      } else {
        const matched = this.nivelesAcceso.find((n) => n.nombre === currentId);
        if (matched) this.searchTermNiveles = matched.nombre;
      }
    }, 200);
  }

  // Paginación
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
  nivelesAcceso: CatalogoNivelAcceso[] = [];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    public permissionService: PermissionService,
  ) {
    this.accesoBDForm = this.fb.group({
      empleadoId: [null, Validators.required],
      servidor: ['', Validators.required],
      baseDatos: ['', Validators.required],
      nivelAcceso: ['', Validators.required],
      observaciones: [''],
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadCatalogos();
  }

  loadData() {
    this.api.getAccesosBD().subscribe((res) => {
      this.accesosBD = res;
      this.aplicarFiltros();
    });
    this.api.getEmpleados().subscribe((res) => {
      this.empleados = res;
    });
    this.api.getPuestos().subscribe((res) => {
      this.puestos = res;
    });
  }

  loadCatalogos() {
    this.api.getNivelesAcceso().subscribe((res) => {
      this.nivelesAcceso = res;
    });
  }

  onEmpleadoChange(event: any) {
    const empId = this.accesoBDForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find((e) => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getPuestoName(puestoId: number | undefined | null): string {
    if (!puestoId) return 'No Asignado';
    return (
      this.puestos.find((p) => p.id === puestoId)?.nombrePuesto || 'Desconocido'
    );
  }

  onSubmit() {
    if (
      this.isEditing &&
      !this.permissionService.tienePermiso('ADMINBASEDATOS', 'EDITAR')
    ) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (
      !this.isEditing &&
      !this.permissionService.tienePermiso('ADMINBASEDATOS', 'CREAR')
    ) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.accesoBDForm.markAllAsTouched();
    if (this.accesoBDForm.invalid) return;

    const data = this.accesoBDForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api
        .updateAccesoBD(this.currentId, { ...data, id: this.currentId })
        .subscribe({
          next: () => {
            this.loadData();
            this.resetForm();
          },
          error: (err: any) =>
            alert('Error al actualizar registro de base de datos.'),
        });
    } else {
      this.api.createAccesoBD(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err: any) => alert('Error al crear registro de base de datos.'),
      });
    }
  }

  edit(acbd: AccesoBD) {
    if (!this.permissionService.tienePermiso('ADMINBASEDATOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = acbd.id;
    this.accesoBDForm.enable();
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones,
    });
    this.onEmpleadoChange(null);
    if (acbd.empleadoId) {
      const matched = this.empleados.find((e) => e.id === acbd.empleadoId);
      if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
      this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }

  verDetalle(acbd: AccesoBD) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = acbd.id;
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones,
    });
    this.onEmpleadoChange(null);
    this.accesoBDForm.disable();
    if (acbd.empleadoId) {
      const matched = this.empleados.find((e) => e.id === acbd.empleadoId);
      if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
      this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }

  delete(id: number, nivelNombre: string) {
    if (!this.permissionService.tienePermiso('ADMINBASEDATOS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.api.deleteAccesoBD(id).subscribe({
        next: () => this.loadData(),
        error: (err: any) => alert('No se pudo eliminar el registro.'),
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.accesoBDForm.reset({
      empleadoId: null,
      servidor: '',
      baseDatos: '',
      nivelAcceso: '',
      observaciones: '',
    });
    this.accesoBDForm.enable();
  }
}