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
import {
  BaseFilterBarComponent,
  FilterColumn,
} from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import {
  AccesoBD,
  Empleado,
  Puesto,
  Catalogo,
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
    BaseFilterBarComponent,
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

      <section class="ucc-card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2 text-ucc-secondary">
            <span class="material-symbols-outlined">table</span>
            <h3 class="text-xl font-bold">Registros de Base de Datos</h3>
          </div>
        </div>



        <div class="overflow-x-auto">
          <table class="ucc-table">
            <thead>
              <tr>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Código Puesto
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Persona
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Puesto
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Servidor
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Base de Datos
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Nivel Acceso
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase"
                >
                  Observaciones
                </th>
                <th
                  class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase"
                >
                  Acciones
                </th>
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
                        [disabled]="!puedeEliminarNivel(acbd.nivelAcceso)"
                        [ngClass]="
                          puedeEliminarNivel(acbd.nivelAcceso)
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-400 cursor-not-allowed opacity-50'
                        "
                        class="p-2 rounded-full transition-all tooltip-trigger"
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

          <div
            class="flex items-center justify-between p-4 border-t border-ucc-neutral-outline/20 bg-ucc-surface-container-lowest"
          >
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
export class BaseDatosComponent implements OnInit {


  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
    this.aplicarFiltros();
  }



  puedeEliminarNivel(nivelNombre: string): boolean {
    const nivel = this.nivelesAcceso.find((n) => n.nombre === nivelNombre);
    return nivel ? nivel.puedeEliminar : false;
  }

  puedeEditarNivel(nivelNombre: string): boolean {
    const nivel = this.nivelesAcceso.find((n) => n.nombre === nivelNombre);
    return nivel ? nivel.puedeEditar : false;
  }

  Math = Math;
  accesosBD: AccesoBD[] = [];
  listaFiltradaTabla: AccesoBD[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];

  accesoBDForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  filtros = {
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
        !this.filtros.codigoPuesto ||
        (acbd.codigoPuesto &&
          acbd.codigoPuesto
            .toLowerCase()
            .includes(this.filtros.codigoPuesto.toLowerCase()));
      const matchNombreCompleto =
        !this.filtros.nombreCompleto ||
        (acbd.nombreCompleto &&
          acbd.nombreCompleto
            .toLowerCase()
            .includes(this.filtros.nombreCompleto.toLowerCase()));
      const matchNombrePuesto =
        !this.filtros.nombrePuesto ||
        (acbd.nombrePuesto &&
          acbd.nombrePuesto
            .toLowerCase()
            .includes(this.filtros.nombrePuesto.toLowerCase()));
      const matchServidor =
        !this.filtros.servidor ||
        (acbd.servidor &&
          acbd.servidor
            .toLowerCase()
            .includes(this.filtros.servidor.toLowerCase()));
      const matchBaseDatos =
        !this.filtros.baseDatos ||
        (acbd.baseDatos &&
          acbd.baseDatos
            .toLowerCase()
            .includes(this.filtros.baseDatos.toLowerCase()));
      const matchNivelAcceso =
        !this.filtros.nivelAcceso ||
        (acbd.nivelAcceso &&
          acbd.nivelAcceso
            .toLowerCase()
            .includes(this.filtros.nivelAcceso.toLowerCase()));
      const matchObservaciones =
        !this.filtros.observaciones ||
        (acbd.observaciones &&
          acbd.observaciones
            .toLowerCase()
            .includes(this.filtros.observaciones.toLowerCase()));

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
    if (!this.puedeEliminarNivel(nivelNombre)) {
      alert(
        'Acceso denegado: El nivel de acceso actual no permite eliminar este registro.',
      );
      return;
    }
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
