import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { PermissionService } from '../../services/permission.service';
import { HardwareIdeal, Puesto, Catalogo } from '../../models/models';

@Component({
  selector: 'app-hardware-ideal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PermisoDirective],
  template: `
    <div class="p-gutter max-w-container-max-width mx-auto space-y-8">
      <div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Especificaciones: Equipo Ideal</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>

      <section class="ucc-card mb-8">
<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">{{ isReadOnly ? 'Detalles del Equipo Ideal' : (isEditing ? 'Editar Plantilla' : 'Formulario de Registro') }}</h3></div>
<form [formGroup]="hwIdealForm" (ngSubmit)="onSubmit()" >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col">
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
                    (mousedown)="seleccionarPuesto(null)">
                  Ninguno
                </li>
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

          <div class="flex flex-col">
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

          <div class="flex flex-col">
            <label class="ucc-label">Procesador (Mínimo recomendado)</label>
<input formControlName="procesador" placeholder="Procesador (Mínimo recomendado)" class="ucc-input">
            @if(hwIdealForm.get('procesador')?.invalid && hwIdealForm.get('procesador')?.touched) {
              <span class="text-red-400 text-xs mt-1">El procesador es requerido.</span>
            }
          </div>

          <div class="flex flex-col">
            <label class="ucc-label">Memoria RAM recomendada</label>
<input formControlName="memoria" placeholder="Memoria RAM recomendada" class="ucc-input">
            @if(hwIdealForm.get('memoria')?.invalid && hwIdealForm.get('memoria')?.touched) {
              <span class="text-red-400 text-xs mt-1">La memoria es requerida.</span>
            }
          </div>

          @if(isPC) {
          <div class="flex flex-col">
            <label class="ucc-label">Disco Duro</label>
<input formControlName="disco" placeholder="Disco Duro" class="ucc-input">
            @if(hwIdealForm.get('disco')?.invalid && hwIdealForm.get('disco')?.touched) {
              <span class="text-red-400 text-xs mt-1">El disco es requerido.</span>
            }
          </div>
          }

          <div class="flex flex-col">
            <label class="ucc-label">Marca de PC Estándar</label>
<input formControlName="marcaPC" placeholder="Marca de PC Estándar" class="ucc-input">
            @if(hwIdealForm.get('marcaPC')?.invalid && hwIdealForm.get('marcaPC')?.touched) {
              <span class="text-red-400 text-xs mt-1">La marca es requerida.</span>
            }
          </div>

          <div class="flex items-center pt-2">
            <label class="flex items-center text-white cursor-pointer select-none">
              <input type="checkbox" formControlName="tecladoNumerico" class="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800">
              Requiere Teclado Numérico
            </label>
          </div>

          <div class="flex flex-col lg:col-span-2">
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
<div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/20 bg-ucc-secondary"><h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">table_chart</span> Registros Actuales</h3></div>
<table class="ucc-table">
          <thead>
            <tr>
              <th>Código Puesto</th>
              <th>Puesto Relacionado</th>
              <th>Equipo Base</th>
              <th>Procesador</th>
              <th>Memoria</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>

          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroCodigoPuesto" placeholder="Filtrar Cód..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuestoRel" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroEquipo" placeholder="Filtrar Equipo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroProcesador" placeholder="Filtrar Procesador..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroMemoria" placeholder="Filtrar Memoria..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
          </thead>
          <tbody>
            @for(hw of paginatedList; track hw.id) {
              <tr>
                <td>{{hw.codigoPuesto}}</td>
                <td>{{hw.nombrePuesto || getPuestoName(hw.puestoId)}}</td>
                <td>{{ getTipoName(hw.tipoHardwareId, hw.tipoEquipo) }}</td>
                <td>{{hw.procesador}}</td>
                <td>{{hw.memoria}}</td>
                <td>
                  <button (click)="verDetalle(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Ver Detalles">
  <span class="material-symbols-outlined">visibility</span>
</button>
<button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'EDITAR'}" (click)="edit(hw)" class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar">
  <span class="material-symbols-outlined">edit</span>
</button>
                  <button *appPermiso="{pantalla: 'EQUIPO_IDEAL', accion: 'ELIMINAR'}" (click)="delete(hw.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar">
  <span class="material-symbols-outlined">delete</span>
</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-gutter max-w-container-max-width mx-auto space-y-8 text-center text-gray-400 bg-gray-800">
                  No hay especificaciones de equipo ideal registradas.
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
export class HardwareIdealComponent implements OnInit {

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
    return nombre.includes('laptop') || nombre.includes('desktop');
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
  filtroPuestoRel: string = '';
  filtroEquipo: string = '';
  filtroProcesador: string = '';
  filtroMemoria: string = '';

  get listaFiltradaTabla() {
    return this.equiposIdeales.filter(hw => {
      const puestoNombre = this.getPuestoName(hw.puestoId);
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuestoRel.toLowerCase());
      const matchEquipo = this.getTipoName(hw.tipoHardwareId, hw.tipoEquipo).toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const matchProcesador = hw.procesador?.toLowerCase().includes(this.filtroProcesador.toLowerCase()) ?? true;
      const matchMemoria = hw.memoria?.toLowerCase().includes(this.filtroMemoria.toLowerCase()) ?? true;

      return matchPuesto && matchEquipo && matchProcesador && matchMemoria;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroCodigoPuesto = '';
    this.filtroPuestoRel = '';
    this.filtroEquipo = '';
    this.filtroProcesador = '';
    this.filtroMemoria = '';
    this.currentPage = 1;
  }

  equiposIdeales: HardwareIdeal[] = [];
  puestos: Puesto[] = [];
  hwIdealForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  // Buscador Autocompletado: Puestos
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
          const matched = this.puestos.find(p => p.id === currentId);
          if (matched) this.searchTermPuestos = matched.nombrePuesto;
      }
    }, 200);
  }


  // Paginación Dinámica
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
      tecladoNumerico: [false],
      otrasConsideraciones: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getHardwareIdeal().subscribe({
      next: (res) => this.equiposIdeales = res,
      error: (err) => console.error('Error al cargar equipos ideales', err)
    });
    this.api.getTiposHardware().subscribe(res => this.tiposHardware = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  getPuestoName(puestoId: number): string {
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
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
    data.tipoHardwareId = this.selectedTipoHardwareId;

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareIdeal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar plantilla.')
      });
    } else {
      console.log("Payload enviado:", data);
      this.api.createHardwareIdeal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear plantilla.')
      });
    }
  }

  edit(hw: HardwareIdeal) {
    if (!this.permissionService.tienePermiso('EQUIPO_IDEAL', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = hw.id;
    this.hwIdealForm.enable();
    this.hwIdealForm.patchValue(hw);
    this.selectedTipoHardwareId = hw.tipoHardwareId || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
    if (hw.puestoId) {
        const matched = this.puestos.find(p => p.id === hw.puestoId);
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('EQUIPO_IDEAL', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está seguro de que desea eliminar este equipo ideal?')) {
      this.api.deleteHardwareIdeal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  verDetalle(hw: HardwareIdeal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwIdealForm.patchValue(hw);
    this.selectedTipoHardwareId = hw.tipoHardwareId || null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
    this.hwIdealForm.disable();
    if (hw.puestoId) {
        const matched = this.puestos.find(p => p.id === hw.puestoId);
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
      tecladoNumerico: false,
      otrasConsideraciones: ''
    });
    this.hwIdealForm.enable();
  }
}
