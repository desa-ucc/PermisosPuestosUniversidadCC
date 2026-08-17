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
import { Plataforma, Empleado, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-plataformas',
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
          Plataformas y Licencias
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
                ? 'Detalles de Plataforma'
                : isEditing
                  ? 'Editar Plataforma'
                  : 'Registrar Plataforma'
            }}
          </h3>
        </div>
        <form [formGroup]="plataformaForm" (ngSubmit)="onSubmit()">
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
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input
                  type="text"
                  class="ucc-input w-full"
                  placeholder="Buscar o seleccionar licencia..."
                  [(ngModel)]="searchTermLicencias"
                  [ngModelOptions]="{ standalone: true }"
                  (focus)="showDropdownLicencias = true"
                  (blur)="cerrarDropdownLicencias()"
                  [disabled]="isReadOnly"
                />
                @if (showDropdownLicencias && !isReadOnly) {
                  <ul
                    class="absolute z-10 w-full mt-1 bg-white border border-ucc-neutral-outline/50 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <li
                      (mousedown)="seleccionarLicencia(null)"
                      class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic"
                    >
                      -- Limpiar selección --
                    </li>
                    @for (lic of licenciasFiltrados; track lic.id) {
                      <li
                        (mousedown)="seleccionarLicencia(lic)"
                        class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral"
                      >
                        {{ lic.nombre }}
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
              <div class="relative">
                <input
                  type="text"
                  class="ucc-input w-full"
                  placeholder="Buscar o seleccionar plataforma..."
                  [(ngModel)]="searchTermPlataformas"
                  [ngModelOptions]="{ standalone: true }"
                  (focus)="showDropdownPlataformas = true"
                  (blur)="cerrarDropdownPlataformas()"
                  [disabled]="isReadOnly"
                />
                @if (showDropdownPlataformas && !isReadOnly) {
                  <ul
                    class="absolute z-10 w-full mt-1 bg-white border border-ucc-neutral-outline/50 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <li
                      (mousedown)="seleccionarPlataforma(null)"
                      class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic"
                    >
                      -- Limpiar selección --
                    </li>
                    @for (plat of plataformasNombresFiltrados; track plat.id) {
                      <li
                        (mousedown)="seleccionarPlataforma(plat)"
                        class="px-4 py-2 hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral"
                      >
                        {{ plat.nombre }}
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Módulos</label>
              <input
                formControlName="modulos"
                type="text"
                class="ucc-input"
                placeholder="Módulos"
              />
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Accesos y Permisos</label>
              <input
                formControlName="accesosPermisos"
                type="text"
                class="ucc-input"
                placeholder="Accesos y Permisos"
              />
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Seleccione Opción</label>
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
          </div>

          <div class="mt-6 flex gap-3 justify-end">
            @if (!isReadOnly) {
              <button
                type="submit"
                [disabled]="plataformaForm.invalid"
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
                  >Cancelar</span
                >
                Cancelar
              </button>
            }
          </div>
        </form>
      </section>

      <!-- CONTENEDOR ESTÁNDAR IDÉNTICO A BASE DE DATOS -->
      <section class="ucc-table-container">
        <div class="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ucc-neutral-outline/20 bg-ucc-secondary" style="background-color: #356575;">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">table_chart</span> Registros de Plataformas
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="ucc-table">
            <thead>
              <tr>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Código Puesto</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Persona</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Puesto</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Licencia</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Plataforma</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Módulos</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Accesos</th>
                <th class="py-4 px-6 font-label-md text-label-md tracking-wider">Nivel</th>
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
                  <input type="text" [(ngModel)]="filtros['persona']" (input)="aplicarFiltros()" (focus)="showFiltroPers = true" (blur)="cerrarFiltroPers()" placeholder="Buscar persona..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroPers) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('persona', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (pers of personasFiltradasTabla; track pers) {
                        <li (mousedown)="seleccionarFiltroCombobox('persona', pers)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pers }}</li>
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
                      @for (pue of puestosFiltradosTabla; track pue) {
                        <li (mousedown)="seleccionarFiltroCombobox('nombrePuesto', pue)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ pue }}</li>
                      }
                    </ul>
                  }
                </td>

                <!-- Licencia -->
                <td class="p-3 relative">
                  <input type="text" [(ngModel)]="filtros['licencias']" (input)="aplicarFiltros()" (focus)="showFiltroLic = true" (blur)="cerrarFiltroLic()" placeholder="Buscar licencia..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroLic) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('licencias', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (lic of licenciasFiltradasTabla; track lic) {
                        <li (mousedown)="seleccionarFiltroCombobox('licencias', lic)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ lic }}</li>
                      }
                    </ul>
                  }
                </td>

                <!-- Plataforma -->
                <td class="p-3 relative">
                  <input type="text" [(ngModel)]="filtros['nombrePlataforma']" (input)="aplicarFiltros()" (focus)="showFiltroPlat = true" (blur)="cerrarFiltroPlat()" placeholder="Buscar plataforma..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroPlat) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('nombrePlataforma', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (plat of plataformasFiltradasTabla; track plat) {
                        <li (mousedown)="seleccionarFiltroCombobox('nombrePlataforma', plat)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ plat }}</li>
                      }
                    </ul>
                  }
                </td>

                <!-- Módulos -->
                <td class="p-3 relative">
                  <input type="text" [(ngModel)]="filtros['modulos']" (input)="aplicarFiltros()" (focus)="showFiltroMod = true" (blur)="cerrarFiltroMod()" placeholder="Buscar módulos..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroMod) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('modulos', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (mod of modulosFiltradosTabla; track mod) {
                        <li (mousedown)="seleccionarFiltroCombobox('modulos', mod)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ mod }}</li>
                      }
                    </ul>
                  }
                </td>

                <!-- Accesos -->
                <td class="p-3 relative">
                  <input type="text" [(ngModel)]="filtros['accesosPermisos']" (input)="aplicarFiltros()" (focus)="showFiltroAcc = true" (blur)="cerrarFiltroAcc()" placeholder="Buscar accesos..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroAcc) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('accesosPermisos', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (acc of accesosFiltradosTabla; track acc) {
                        <li (mousedown)="seleccionarFiltroCombobox('accesosPermisos', acc)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ acc }}</li>
                      }
                    </ul>
                  }
                </td>

                <!-- Nivel -->
                <td class="p-3 relative">
                  <input type="text" [(ngModel)]="filtros['nivelAcceso']" (input)="aplicarFiltros()" (focus)="showFiltroNiv = true" (blur)="cerrarFiltroNiv()" placeholder="Buscar nivel..." class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                  @if (showFiltroNiv) {
                    <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      <li (mousedown)="seleccionarFiltroCombobox('nivelAcceso', '')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos --</li>
                      @for (niv of nivelesFiltradosTabla; track niv) {
                        <li (mousedown)="seleccionarFiltroCombobox('nivelAcceso', niv)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ niv }}</li>
                      }
                    </ul>
                  }
                </td>

                <td class="p-3 text-center">
                  <div class="flex justify-center">
                    <div class="flex flex-col gap-1">
                      <button (click)="exportarReporte()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                        <span class="material-symbols-outlined text-[16px]">download</span> Generar Reporte</button>
                      <button (click)="limpiarFiltros()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                        <span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar Filtros</button>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              @for (p of paginatedList; track p.id) {
                <tr>
                  <td class="py-4 px-6 font-body-md text-body-md font-bold">
                    {{ p.codigoPuesto }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ getEmpleadoName(p.empleadoId) }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ p.nombrePuesto }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    <span
                      class="px-2 py-1 rounded text-xs font-semibold"
                      [ngClass]="{
                        'bg-green-800 text-green-200': p.licencias === 'Posee',
                        'bg-gray-600 text-gray-300': p.licencias !== 'Posee',
                      }"
                    >
                      {{ p.licencias }}
                    </span>
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ p.nombrePlataforma }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ p.modulos }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ p.accesosPermisos }}
                  </td>
                  <td class="py-4 px-6 font-body-md text-body-md">
                    {{ p.nivelAcceso }}
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex justify-center gap-3">
                      <button
                        (click)="verDetalle(p)"
                        *appPermiso="{
                          pantalla: 'PLATAFORMAS',
                          accion: 'VER',
                        }"
                        class="p-2 text-ucc-primary hover:bg-ucc-primary/10 rounded-full transition-all"
                        title="Ver Detalles"
                      >
                        <span class="material-symbols-outlined text-[20px]"
                          >visibility</span
                        >
                      </button>
                      <button
                        *appPermiso="{
                          pantalla: 'PLATAFORMAS',
                          accion: 'EDITAR',
                        }"
                        (click)="edit(p)"
                        class="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                        title="Editar"
                      >
                        <span class="material-symbols-outlined text-[20px]"
                          >edit</span
                        >
                      </button>
                      <button
                        *appPermiso="{
                          pantalla: 'PLATAFORMAS',
                          accion: 'ELIMINAR',
                        }"
                        (click)="delete(p.id)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
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
                    colspan="9"
                    class="text-center py-12 text-ucc-neutral-variant"
                  >
                    <div class="flex flex-col items-center gap-3">
                      <span
                        class="material-symbols-outlined text-[48px] opacity-50"
                        >devices</span
                      >
                      <p class="font-medium">
                        No hay plataformas registradas en el sistema.
                      </p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- FOOTER PAGINACIÓN -->
          <div class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface-container-lowest">
            <div
              class="flex items-center gap-4 text-sm text-ucc-neutral-variant"
            >
              <span
                >Mostrando {{ (currentPage - 1) * pageSize + 1 }} -
                {{
                  Math.min(currentPage * pageSize, listaFiltradaTabla.length)
                }}
                de {{ listaFiltradaTabla.length }}</span
              >
              <select
                (change)="changePageSize($event)"
                class="bg-transparent border border-ucc-neutral-outline/50 rounded px-2 py-1 outline-none focus:border-ucc-primary"
              >
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size" [selected]="size === pageSize">
                    {{ size }} por pág.
                  </option>
                }
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="prevPage()"
                [disabled]="currentPage === 1"
                class="p-1 rounded hover:bg-ucc-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span class="text-sm font-medium min-w-[3rem] text-center"
                >Pág. {{ currentPage }}</span
              >
              <button
                (click)="nextPage()"
                [disabled]="currentPage >= totalPages"
                class="p-1 rounded hover:bg-ucc-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class PlataformasComponent implements OnInit {
  Math = Math;
  listaPlataformas: Plataforma[] = [];
  listaFiltradaTabla: any[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  plataformaForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  showFiltroCodP = false;
  showFiltroPers = false;
  showFiltroPue = false;
  showFiltroLic = false;
  showFiltroPlat = false;
  showFiltroMod = false;
  showFiltroAcc = false;
  showFiltroNiv = false;

  get codigosPuestoUnicos(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.codigoPuesto).filter((c): c is string => Boolean(c)))).sort();
  }

  get personasUnicas(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => this.getEmpleadoName(p.empleadoId)).filter((n): n is string => Boolean(n) && n !== 'Desconocido'))).sort();
  }

  get puestosUnicos(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.nombrePuesto).filter((pu): pu is string => Boolean(pu)))).sort();
  }

  get licenciasUnicas(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.licencias).filter((l): l is string => Boolean(l)))).sort();
  }

  get plataformasUnicas(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.nombrePlataforma).filter((pl): pl is string => Boolean(pl)))).sort();
  }

  get modulosUnicos(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.modulos).filter((m): m is string => Boolean(m)))).sort();
  }

  get accesosUnicos(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.accesosPermisos).filter((a): a is string => Boolean(a)))).sort();
  }

  get nivelesUnicos(): string[] {
    return Array.from(new Set(this.listaPlataformas.map(p => p.nivelAcceso).filter((n): n is string => Boolean(n)))).sort();
  }

  get codigosPuestoFiltradosTabla() { return this.codigosPuestoUnicos.filter(c => c.toLowerCase().includes((this.filtros['codigoPuesto'] || '').toLowerCase())); }
  get personasFiltradasTabla() { return this.personasUnicas.filter(p => p.toLowerCase().includes((this.filtros['persona'] || '').toLowerCase())); }
  get puestosFiltradosTabla() { return this.puestosUnicos.filter(p => p.toLowerCase().includes((this.filtros['nombrePuesto'] || '').toLowerCase())); }
  get licenciasFiltradasTabla() { return this.licenciasUnicas.filter(l => l.toLowerCase().includes((this.filtros['licencias'] || '').toLowerCase())); }
  get plataformasFiltradasTabla() { return this.plataformasUnicas.filter(pl => pl.toLowerCase().includes((this.filtros['nombrePlataforma'] || '').toLowerCase())); }
  get modulosFiltradosTabla() { return this.modulosUnicos.filter(m => m.toLowerCase().includes((this.filtros['modulos'] || '').toLowerCase())); }
  get accesosFiltradosTabla() { return this.accesosUnicos.filter(a => a.toLowerCase().includes((this.filtros['accesosPermisos'] || '').toLowerCase())); }
  get nivelesFiltradosTabla() { return this.nivelesUnicos.filter(n => n.toLowerCase().includes((this.filtros['nivelAcceso'] || '').toLowerCase())); }

  seleccionarFiltroCombobox(key: string, val: string) {
    this.filtros[key] = val;
    this.showFiltroCodP = false;
    this.showFiltroPers = false;
    this.showFiltroPue = false;
    this.showFiltroLic = false;
    this.showFiltroPlat = false;
    this.showFiltroMod = false;
    this.showFiltroAcc = false;
    this.showFiltroNiv = false;
    this.aplicarFiltros();
  }

  cerrarFiltroCodP() { setTimeout(() => this.showFiltroCodP = false, 200); }
  cerrarFiltroPers() { setTimeout(() => this.showFiltroPers = false, 200); }
  cerrarFiltroPue() { setTimeout(() => this.showFiltroPue = false, 200); }
  cerrarFiltroLic() { setTimeout(() => this.showFiltroLic = false, 200); }
  cerrarFiltroPlat() { setTimeout(() => this.showFiltroPlat = false, 200); }
  cerrarFiltroMod() { setTimeout(() => this.showFiltroMod = false, 200); }
  cerrarFiltroAcc() { setTimeout(() => this.showFiltroAcc = false, 200); }
  cerrarFiltroNiv() { setTimeout(() => this.showFiltroNiv = false, 200); }

  filtros: { [key: string]: any } = {
    codigoPuesto: '',
    persona: '',
    nombrePuesto: '',
    licencias: '',
    nombrePlataforma: '',
    modulos: '',
    accesosPermisos: '',
    nivelAcceso: '',
  };

  aplicarFiltros() {
    const dataList = this.listaPlataformas;

    if (!dataList || dataList.length === 0) {
      this.listaFiltradaTabla = [];
      return;
    }

    this.listaFiltradaTabla = dataList.filter((item: any) => {
      let matches = true;
      const personaNombre = this.getEmpleadoName(item.empleadoId).toLowerCase();

      for (const key in this.filtros) {
        if (this.filtros[key]) {
          const valorFiltro = this.filtros[key].toString().toLowerCase();
          let valorItem = '';

          if (key === 'persona') {
            valorItem = personaNombre;
          } else {
            valorItem = (item[key] || '').toString().toLowerCase();
          }

          if (!valorItem.includes(valorFiltro)) {
            matches = false;
            break;
          }
        }
      }
      return matches;
    });

    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
    this.aplicarFiltros();
  }

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.listaFiltradaTabla.map((row: any) => ({
      'CÓDIGO PUESTO': row.codigoPuesto || 'N/A',
      PERSONA: this.getEmpleadoName(row.empleadoId) || 'N/A',
      PUESTO: row.nombrePuesto || 'N/A',
      LICENCIA: row.licencias || 'N/A',
      PLATAFORMA: row.nombrePlataforma || 'N/A',
      MÓDULOS: row.modulos || 'N/A',
      'ACCESOS/PERMISOS': row.accesosPermisos || 'N/A',
      'NIVEL DE ACCESO': row.nivelAcceso || 'N/A',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 35 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Plataformas');
    XLSX.writeFile(wb, `Reporte_Plataformas.xlsx`);
  }

  limpiarFiltros() {
    this.filtros = {
      codigoPuesto: '',
      persona: '',
      nombrePuesto: '',
      licencias: '',
      nombrePlataforma: '',
      modulos: '',
      accesosPermisos: '',
      nivelAcceso: '',
    };
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  showDropdownEmpleados = false;
  searchTermEmpleados = '';
  get empleadosFiltrados() {
    const filtrados = this.empleados.filter((e) =>
      e.nombreCompleto
        .toLowerCase()
        .includes(this.searchTermEmpleados.toLowerCase()),
    );

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
      this.plataformaForm.patchValue({ empleadoId: empleado.id });
      this.searchTermEmpleados = empleado.nombreCompleto;
    } else {
      this.plataformaForm.patchValue({ empleadoId: null });
      this.searchTermEmpleados = '';
    }
    this.showDropdownEmpleados = false;
    this.onEmpleadoChange(null);
  }

  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.plataformaForm.get('empleadoId')?.value;
      if (!currentId) {
        this.searchTermEmpleados = '';
      } else {
        const matched = this.empleados.find((e) => e.id === currentId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }

  showDropdownLicencias = false;
  searchTermLicencias = '';
  get licenciasFiltrados() {
    return this.tiposLicencia.filter((l) =>
      l.nombre.toLowerCase().includes(this.searchTermLicencias.toLowerCase()),
    );
  }

  seleccionarLicencia(licencia: Catalogo | null) {
    if (licencia) {
      this.plataformaForm.patchValue({ licencias: licencia.nombre });
      this.searchTermLicencias = licencia.nombre;
    } else {
      this.plataformaForm.patchValue({ licencias: null });
      this.searchTermLicencias = '';
    }
    this.showDropdownLicencias = false;
  }

  cerrarDropdownLicencias() {
    setTimeout(() => {
      this.showDropdownLicencias = false;
      const currentId = this.plataformaForm.get('licencias')?.value;
      if (!currentId) {
        this.searchTermLicencias = '';
      } else {
        const matched = this.tiposLicencia.find((l) => l.nombre === currentId);
        if (matched) this.searchTermLicencias = matched.nombre;
      }
    }, 200);
  }

  showDropdownPlataformas = false;
  searchTermPlataformas = '';
  get plataformasNombresFiltrados() {
    return this.plataformasNombres.filter((p) =>
      p.nombre.toLowerCase().includes(this.searchTermPlataformas.toLowerCase()),
    );
  }

  seleccionarPlataforma(plataforma: Catalogo | null) {
    if (plataforma) {
      this.plataformaForm.patchValue({ nombrePlataforma: plataforma.nombre });
      this.searchTermPlataformas = plataforma.nombre;
    } else {
      this.plataformaForm.patchValue({ nombrePlataforma: null });
      this.searchTermPlataformas = '';
    }
    this.showDropdownPlataformas = false;
  }

  cerrarDropdownPlataformas() {
    setTimeout(() => {
      this.showDropdownPlataformas = false;
      const currentId = this.plataformaForm.get('nombrePlataforma')?.value;
      if (!currentId) {
        this.searchTermPlataformas = '';
      } else {
        const matched = this.plataformasNombres.find(
          (p) => p.nombre === currentId,
        );
        if (matched) this.searchTermPlataformas = matched.nombre;
      }
    }, 200);
  }

  showDropdownNiveles = false;
  searchTermNiveles = '';
  get nivelesFiltrados() {
    return this.nivelesAcceso.filter((n) =>
      n.nombre.toLowerCase().includes(this.searchTermNiveles.toLowerCase()),
    );
  }

  seleccionarNivel(nivel: Catalogo | null) {
    if (nivel) {
      this.plataformaForm.patchValue({ nivelAcceso: nivel.nombre });
      this.searchTermNiveles = nivel.nombre;
    } else {
      this.plataformaForm.patchValue({ nivelAcceso: null });
      this.searchTermNiveles = '';
    }
    this.showDropdownNiveles = false;
  }

  cerrarDropdownNiveles() {
    setTimeout(() => {
      this.showDropdownNiveles = false;
      const currentId = this.plataformaForm.get('nivelAcceso')?.value;
      if (!currentId) {
        this.searchTermNiveles = '';
      } else {
        const matched = this.nivelesAcceso.find((n) => n.nombre === currentId);
        if (matched) this.searchTermNiveles = matched.nombre;
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
  nivelesAcceso: Catalogo[] = [];
  plataformasNombres: Catalogo[] = [];
  tiposLicencia: Catalogo[] = [];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    public permissionService: PermissionService,
  ) {
    this.plataformaForm = this.fb.group({
      empleadoId: [null, Validators.required],
      licencias: ['', Validators.required],
      nombrePlataforma: ['', Validators.required],
      modulos: ['', Validators.required],
      accesosPermisos: ['', Validators.required],
      nivelAcceso: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.loadCatalogos();
    this.api.getEmpleados().subscribe((res) => {
      this.empleados = res;
      this.api.getPuestos().subscribe((p) => {
        this.puestos = p;
        this.loadData();
      });
    });
  }

  loadData() {
    this.api.getPlataformas().subscribe({
      next: (res: any[]) => {
        this.listaPlataformas = res.map((item) => ({
          id: item.id || item.Id,
          empleadoId: item.empleadoId || item.EmpleadoId,
          codigoPuesto: item.codigoPuesto || item.CodigoPuesto || 'N/A',
          nombrePuesto: item.nombrePuesto || item.NombrePuesto || 'N/A',
          nombrePlataforma:
            item.nombrePlataforma || item.NombrePlataforma || 'N/A',
          licencias: item.licencias || item.Licencias || 'N/A',
          modulos: item.modulos || item.Modulos || 'N/A',
          accesosPermisos:
            item.accesosPermisos || item.AccesosPermisos || 'N/A',
          nivelAcceso: item.nivelAcceso || item.NivelAcceso || 'N/A',
        }));

        this.listaFiltradaTabla = [...this.listaPlataformas];
        this.aplicarFiltros();
      },
    });
  }

  loadCatalogos() {
    this.api.getNivelesAcceso().subscribe((res) => (this.nivelesAcceso = res));
    this.api
      .getPlataformasNombres()
      .subscribe((res) => (this.plataformasNombres = res));
    this.api.getTiposLicencia().subscribe((res) => (this.tiposLicencia = res));
  }

  onEmpleadoChange(event: any) {
    const empId = this.plataformaForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find((e) => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getEmpleadoName(id: number): string {
    return (
      this.empleados.find((e) => e.id === id)?.nombreCompleto || 'Desconocido'
    );
  }

  getPuestoByEmpleado(empleadoId: number): string {
    const emp = this.empleados.find((e) => e.id === empleadoId);
    if (!emp || !emp.puestoId) return 'No Asignado';
    return (
      this.puestos.find((p) => p.id === emp.puestoId)?.nombrePuesto ||
      'Desconocido'
    );
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
      !this.permissionService.tienePermiso('PLATAFORMAS', 'EDITAR')
    ) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (
      !this.isEditing &&
      !this.permissionService.tienePermiso('PLATAFORMAS', 'CREAR')
    ) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.plataformaForm.markAllAsTouched();
    if (this.plataformaForm.invalid) return;

    const data = this.plataformaForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api
        .updatePlataforma(this.currentId, { ...data, id: this.currentId })
        .subscribe({
          next: () => {
            this.loadData();
            this.resetForm();
          },
          error: (err) => alert('Error al actualizar registro de plataforma.'),
        });
    } else {
      this.api.createPlataforma(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro de plataforma.'),
      });
    }
  }

  edit(plat: Plataforma) {
    if (!this.permissionService.tienePermiso('PLATAFORMAS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = plat.id;
    this.plataformaForm.enable();
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso,
    });
    this.onEmpleadoChange(null);
    if (plat.empleadoId) {
      const matched = this.empleados.find((e) => e.id === plat.empleadoId);
      if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
      this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('PLATAFORMAS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if (confirm('¿Está Seguro de que desea eliminar este registro?')) {
      this.api.deletePlataforma(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.'),
      });
    }
  }

  verDetalle(plat: Plataforma) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = plat.id;
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso,
    });
    this.onEmpleadoChange(null);
    this.plataformaForm.disable();
    if (plat.empleadoId) {
      const matched = this.empleados.find((e) => e.id === plat.empleadoId);
      if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
      this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.plataformaForm.reset({
      empleadoId: null,
      licencias: '',
      nombrePlataforma: '',
      modulos: '',
      accesosPermisos: '',
      nivelAcceso: '',
    });
    this.plataformaForm.enable();
  }
}