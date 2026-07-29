import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { BaseFilterBarComponent, FilterColumn } from '../shared/base-filter-bar/base-filter-bar.component';
import { PermissionService } from '../../services/permission.service';
import { Empleado, Puesto } from '../../models/models';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective, BaseFilterBarComponent],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Colaboradores</h2>
        <p class="font-body-lg text-body-lg text-ucc-neutral-variant max-w-2xl mt-1">
          Administre la información del personal y asigne los puestos correspondientes dentro de la organización.
        </p>
      </div>

      <section class="ucc-card">
        <div class="flex items-center gap-2 mb-6 text-ucc-secondary">
          <span class="material-symbols-outlined">add_circle</span>
          <h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles del Colaborador' : (isEditing ? 'Editar Colaborador' : 'Registrar Colaborador') }}</h3>
        </div>

        <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="ucc-label">Código Empleado</label>
              <input formControlName="codigoEmpleado" placeholder="Ej: EMP-001" class="ucc-input">
              @if(empleadoForm.get('codigoEmpleado')?.invalid && empleadoForm.get('codigoEmpleado')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">El código es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Nombre Completo</label>
              <input formControlName="nombreCompleto" placeholder="Nombre completo" class="ucc-input">
              @if(empleadoForm.get('nombreCompleto')?.invalid && empleadoForm.get('nombreCompleto')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">El nombre completo es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Correo Institucional</label>
              <input formControlName="correoInstitucional" placeholder="correo@ucc.edu" type="email" class="ucc-input">
              @if(empleadoForm.get('correoInstitucional')?.invalid && empleadoForm.get('correoInstitucional')?.touched) {
                <span class="text-ucc-error text-xs mt-1 block">Un correo válido es requerido.</span>
              }
            </div>

            <div class="flex flex-col">
              <label class="ucc-label">Puesto Asignado</label>
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
                    (click)="seleccionarPuesto(null)">
                  Ninguno
                </li>
                @for(puesto of puestosFiltrados; track puesto.id) {
                  <li class="px-4 py-3 text-body-md text-ucc-neutral-text hover:bg-ucc-primary-container/10 cursor-pointer transition-colors"
                      (click)="seleccionarPuesto(puesto)">
                    {{puesto.nombrePuesto}}
                  </li>
                } @empty {
                  <li class="px-4 py-3 text-ucc-neutral-variant italic">No se encontraron resultados</li>
                }
              </ul>
            </div>
            </div>
          </div>

          <div class="flex gap-4 mt-6">
            @if(!isReadOnly) {
              <button *appPermiso="{pantalla: 'COLABORADORES', accion: isEditing ? 'EDITAR' : 'CREAR'}" type="submit" [disabled]="empleadoForm.invalid" class="ucc-btn-primary w-full md:w-auto">
                @if(isEditing) {
                  <span class="material-symbols-outlined">save</span> Actualizar
                } @else {
                  <span class="material-symbols-outlined">add</span> Agregar
                }
              </button>
            }

            @if(isEditing || isReadOnly) {
              <button type="button" (click)="resetForm()" class="ucc-btn-secondary w-full md:w-auto">
                {{ isReadOnly ? 'Volver' : 'Cancelar' }}
              </button>
            }
          </div>
        </form>
      </section>

      <section class="ucc-table-container">
        <div class="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ucc-neutral-outline/25 bg-ucc-secondary" style="background-color: #356575;">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined">group</span> Colaboradores Registrados
          </h3>
        </div>

        <table class="ucc-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Puesto</th>
              <th class="text-center w-32">Acciones</th>
            </tr>

            <!-- FILA DE FILTROS TIPO COMBOBOX BUSCABLE AMPLIOS Y ESTILIZADOS -->
            <tr class="bg-ucc-surface-container-low border-b border-ucc-neutral-outline/20">
              <!-- Filtro Código -->
              <td class="p-3 relative">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-ucc-neutral-variant text-[18px]">filter_list</span>
                  <input type="text" 
                         [(ngModel)]="filtroCodigo" 
                         (focus)="showFiltroCod = true" 
                         (blur)="cerrarFiltroCod()" 
                         placeholder="Buscar código..." 
                         class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                </div>
                @if (showFiltroCod) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCodigo('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos los códigos --</li>
                    @for (cod of codigosFiltrados; track cod) {
                      <li (mousedown)="seleccionarFiltroCodigo(cod)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ cod }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Filtro Nombre -->
              <td class="p-3 relative">
                <input type="text" 
                       [(ngModel)]="filtroNombre" 
                       (focus)="showFiltroNom = true" 
                       (blur)="cerrarFiltroNom()" 
                       placeholder="Buscar nombre..." 
                       class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroNom) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroNombre('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos los nombres --</li>
                    @for (nom of nombresFiltrados; track nom) {
                      <li (mousedown)="seleccionarFiltroNombre(nom)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ nom }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Filtro Correo -->
              <td class="p-3 relative">
                <input type="text" 
                       [(ngModel)]="filtroCorreo" 
                       (focus)="showFiltroCor = true" 
                       (blur)="cerrarFiltroCor()" 
                       placeholder="Buscar correo..." 
                       class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroCor) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroCorreo('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos los correos --</li>
                    @for (correo of correosFiltrados; track correo) {
                      <li (mousedown)="seleccionarFiltroCorreo(correo)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ correo }}</li>
                    }
                  </ul>
                }
              </td>

              <!-- Filtro Puesto -->
              <td class="p-3 relative">
                <input type="text" 
                       [(ngModel)]="filtroPuestoTabla" 
                       (focus)="showFiltroPue = true" 
                       (blur)="cerrarFiltroPue()" 
                       placeholder="Buscar puesto..." 
                       class="w-full bg-white border border-ucc-neutral-outline/40 rounded-lg py-2 px-3.5 text-sm font-medium placeholder:text-ucc-neutral-variant focus:border-ucc-primary focus:ring-2 focus:ring-ucc-primary/20 outline-none transition-all shadow-sm">
                @if (showFiltroPue) {
                  <ul class="absolute z-50 left-3 right-3 mt-1 bg-white border border-outline-variant/30 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    <li (mousedown)="seleccionarFiltroPuesto('')" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral-variant italic font-medium">-- Todos los puestos --</li>
                    @for (puesto of puestosTablaFiltrados; track puesto) {
                      <li (mousedown)="seleccionarFiltroPuesto(puesto)" class="px-4 py-2.5 text-sm hover:bg-ucc-surface-container-low cursor-pointer text-ucc-neutral font-medium">{{ puesto }}</li>
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
                    <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary font-medium hover:bg-ucc-primary/10 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors">
                      <span class="material-symbols-outlined text-[16px]">refresh</span> Limpiar
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            @for(emp of paginatedList; track emp.id) {
              <tr>
                <td class="font-bold">{{emp.codigoEmpleado}}</td>
                <td>{{emp.nombreCompleto}}</td>
                <td>{{emp.correoInstitucional}}</td>
                <td>
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-ucc-primary-container/10 text-ucc-primary text-[11px] font-bold">
                    {{emp.nombrePuesto || 'No Asignado'}}
                  </span>
                </td>
                <td>
                  <div class="flex justify-center gap-3">
                    <button (click)="verDetalle(emp)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button *appPermiso="{pantalla: 'COLABORADORES', accion: 'EDITAR'}" (click)="edit(emp)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button *appPermiso="{pantalla: 'COLABORADORES', accion: 'ELIMINAR'}" (click)="delete(emp.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="py-8 px-6 text-center text-ucc-neutral-variant">
                  No hay colaboradores registrados en el sistema.
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
export class ColaboradoresComponent implements OnInit {
  listaFiltradaTabla: any[] = [];
  filtros: any = {};
  filterConfig: FilterColumn[] = [];

  showFiltroCod = false;
  showFiltroNom = false;
  showFiltroCor = false;
  showFiltroPue = false;

  get codigosDisponibles(): string[] {
    return Array.from(new Set(this.empleados.map(e => e.codigoEmpleado).filter(Boolean))).sort();
  }

  get nombresDisponibles(): string[] {
    return Array.from(new Set(this.empleados.map(e => e.nombreCompleto).filter(Boolean))).sort();
  }

  get correosDisponibles(): string[] {
    return Array.from(new Set(this.empleados.map(e => e.correoInstitucional).filter(Boolean))).sort();
  }

  get puestosDisponibles(): string[] {
    return Array.from(new Set(this.empleados.map(e => e.nombrePuesto || 'No Asignado').filter(Boolean))).sort();
  }

  get codigosFiltrados() {
    return this.codigosDisponibles.filter(c => c.toLowerCase().includes(this.filtroCodigo.toLowerCase()));
  }

  get nombresFiltrados() {
    return this.nombresDisponibles.filter(n => n.toLowerCase().includes(this.filtroNombre.toLowerCase()));
  }

  get correosFiltrados() {
    return this.correosDisponibles.filter(cor => cor.toLowerCase().includes(this.filtroCorreo.toLowerCase()));
  }

  get puestosTablaFiltrados() {
    return this.puestosDisponibles.filter(p => p.toLowerCase().includes(this.filtroPuestoTabla.toLowerCase()));
  }

  seleccionarFiltroCodigo(val: string) {
    this.filtroCodigo = val;
    this.showFiltroCod = false;
    this.currentPage = 1;
  }

  seleccionarFiltroNombre(val: string) {
    this.filtroNombre = val;
    this.showFiltroNom = false;
    this.currentPage = 1;
  }

  seleccionarFiltroCorreo(val: string) {
    this.filtroCorreo = val;
    this.showFiltroCor = false;
    this.currentPage = 1;
  }

  seleccionarFiltroPuesto(val: string) {
    this.filtroPuestoTabla = val;
    this.showFiltroPue = false;
    this.currentPage = 1;
  }

  cerrarFiltroCod() {
    setTimeout(() => this.showFiltroCod = false, 200);
  }

  cerrarFiltroNom() {
    setTimeout(() => this.showFiltroNom = false, 200);
  }

  cerrarFiltroCor() {
    setTimeout(() => this.showFiltroCor = false, 200);
  }

  cerrarFiltroPue() {
    setTimeout(() => this.showFiltroPue = false, 200);
  }

  onFiltersChanged(newFilters: any) {
    this.filtros = newFilters;
  }

  filtroCodigo: string = '';
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroPuestoTabla: string = '';

  get empleadosFiltradosTabla() {
    return this.empleados.filter(emp => {
      const matchCodigo = !this.filtroCodigo || (emp.codigoEmpleado && emp.codigoEmpleado.toLowerCase().includes(this.filtroCodigo.toLowerCase()));
      const matchNombre = !this.filtroNombre || (emp.nombreCompleto && emp.nombreCompleto.toLowerCase().includes(this.filtroNombre.toLowerCase()));
      const matchCorreo = !this.filtroCorreo || (emp.correoInstitucional && emp.correoInstitucional.toLowerCase().includes(this.filtroCorreo.toLowerCase()));
      const puestoActual = emp.nombrePuesto || 'No Asignado';
      const matchPuesto = !this.filtroPuestoTabla || puestoActual.toLowerCase().includes(this.filtroPuestoTabla.toLowerCase());

      return matchCodigo && matchNombre && matchCorreo && matchPuesto;
    });
  }

  aplicarFiltrosTabla() {
    this.currentPage = 1;
  }

  exportarReporte() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const data = this.empleadosFiltradosTabla.map((row: any) => ({
      'CÓDIGO': row.codigoEmpleado,
      'NOMBRE COMPLETO': row.nombreCompleto,
      'CORREO INSTITUCIONAL': row.correoInstitucional,
      'PUESTO': row.nombrePuesto || 'No Asignado',
      'OBSERVACIONES': row.observaciones || 'N/A'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{wch: 15}, {wch: 35}, {wch: 30}, {wch: 30}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
    XLSX.writeFile(wb, `Reporte_Colaboradores.xlsx`);
  }

  limpiarFiltrosTabla() {
    this.filtroCodigo = '';
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroPuestoTabla = '';
    this.currentPage = 1;
  }

  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  empleadoForm: FormGroup;
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
        this.empleadoForm.patchValue({ puestoId: puesto.id });
        this.searchTermPuestos = puesto.nombrePuesto;
    } else {
        this.empleadoForm.patchValue({ puestoId: null });
        this.searchTermPuestos = '';
    }
    this.showDropdownPuestos = false;
  }

  cerrarDropdownPuestos() {
    setTimeout(() => {
      this.showDropdownPuestos = false;
      const currentId = this.empleadoForm.get('puestoId')?.value;
      if (!currentId) {
          this.searchTermPuestos = '';
      } else {
          const matched = this.puestos.find(p => p.id === currentId);
          if (matched) this.searchTermPuestos = matched.nombrePuesto;
      }
    }, 200);
  }

  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.empleadosFiltradosTabla.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.empleadosFiltradosTabla.length / this.pageSize) || 1;
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
    this.empleadoForm = this.fb.group({
      codigoEmpleado: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      correoInstitucional: ['', [Validators.required, Validators.email]],
      puestoId: [null]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPuestos().subscribe({
      next: (res) => this.puestos = res,
      error: (err) => console.error('Error al cargar puestos', err)
    });

    this.api.getEmpleados().subscribe({
      next: (res) => {
        this.empleados = res;
      },
      error: (err) => {
        console.error('Error al cargar empleados', err);
      }
    });
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('COLABORADORES', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('COLABORADORES', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.empleadoForm.markAllAsTouched();
    if (this.empleadoForm.invalid) return;

    const data = this.empleadoForm.value;

    if (this.isEditing && this.currentId) {
      this.api.updateEmpleado(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar empleado.')
      });
    } else {
      this.api.createEmpleado(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear empleado.')
      });
    }
  }

  edit(emp: Empleado) {
    if (!this.permissionService.tienePermiso('COLABORADORES', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = emp.id;
    this.empleadoForm.enable();
    this.searchTermPuestos = '';
    this.empleadoForm.patchValue({
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: emp.nombreCompleto,
      correoInstitucional: emp.correoInstitucional,
      puestoId: emp.puestoId || null
    });

    if (emp.puestoId) {
        const matched = this.puestos.find(p => p.id === emp.puestoId);
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('COLABORADORES', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está seguro de que desea eliminar este colaborador?')) {
      this.api.deleteEmpleado(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Error al eliminar empleado. Verifique si tiene hardware/software asignado.')
      });
    }
  }

  verDetalle(emp: Empleado) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = emp.id;
    this.empleadoForm.patchValue({
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: emp.nombreCompleto,
      correoInstitucional: emp.correoInstitucional,
      puestoId: emp.puestoId || null
    });

    if (emp.puestoId) {
        const matched = this.puestos.find(p => p.id === emp.puestoId);
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
    this.empleadoForm.disable();
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.empleadoForm.reset({
      codigoEmpleado: '',
      nombreCompleto: '',
      correoInstitucional: '',
      puestoId: null
    });
    this.empleadoForm.enable();
    this.searchTermPuestos = '';
  }
}