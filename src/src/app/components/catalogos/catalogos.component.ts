import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PermisoDirective } from '../../directives/permiso.directive';
import { Catalogo } from '../../models/models';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PermisoDirective],
  template: `
<div class="p-gutter max-w-container-max-width mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col gap-1 mb-8 mt-4">
        <h2 class="font-headline-lg text-headline-lg text-ucc-secondary">Gestión de Catálogos Base</h2>
        <p class="text-body-md text-ucc-neutral-variant">Configura y administra los parámetros fundamentales del ecosistema institucional.</p>
    </div>

    <div class="grid grid-cols-12 gap-gutter items-start">
        <!-- Left: Form & Table -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
            <!-- Integrated Category Tabs & Add Form -->
            <div class="ucc-card p-0">
                <!-- Tabs Integrated here -->
                <div class="flex border-b border-ucc-neutral-outline/30 p-1 bg-ucc-neutral-outline/10">
                    <button (click)="setTab('ambientes')" [ngClass]="activeTab === 'ambientes' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">layers</span> Ambientes
                    </button>
                    <button (click)="setTab('sitios')" [ngClass]="activeTab === 'sitios' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">location_on</span> Sitios
                    </button>

                    <button (click)="setTab('tiposHardware')" [ngClass]="activeTab === 'tiposHardware' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">devices</span> Tipos de Hardware
                    </button>
                    <button (click)="setTab('nivelesAcceso')" [ngClass]="activeTab === 'nivelesAcceso' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                        <span>Niveles de Acceso</span>
                    </button>
                    <button (click)="setTab('plataformas')" [ngClass]="activeTab === 'plataformas' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">cloud_done</span> Plataformas
                    </button>
                </div>

                <div class="p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="material-symbols-outlined text-ucc-primary-container p-2 bg-ucc-primary-container/10 rounded-lg">add_circle</span>
                        <h3 class="font-title-lg text-title-lg text-ucc-secondary">{{ editingId ? 'Editar' : 'Registrar Nuevo' }} {{ getTabName() }}</h3>
                    </div>

                    <form [formGroup]="catForm" (ngSubmit)="onSubmit()" class="flex flex-col md:flex-row gap-4 items-end">
                        <div class="flex-1 w-full">
                            <label class="block text-label-md text-ucc-neutral-variant mb-2 ml-1 uppercase">NOMBRE DEL {{ getTabName() }}</label>
                            <input formControlName="nombre" class="ucc-input" [placeholder]="getPlaceholder()" type="text"/>
                            @if(catForm.get('nombre')?.invalid && catForm.get('nombre')?.touched) {
                              <span class="text-ucc-error text-xs mt-1 block">El nombre es requerido.</span>
                            }
                        </div>
                        @if(activeTab === 'tiposLicencia') {
                        <div class="w-full md:w-48">
                            <label class="block text-label-md text-ucc-neutral-variant mb-2 ml-1 uppercase">CANT. CONTRATADA</label>
                            <input type="number" formControlName="cantidadContratada" class="ucc-input w-full h-12 px-4" style="border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div class="w-full md:w-48">
                            <label class="block text-label-md text-ucc-neutral-variant mb-2 ml-1 uppercase">F. VENCIMIENTO</label>
                            <input type="date" formControlName="fechaVencimiento" class="ucc-input w-full h-12 px-4" style="border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        }
                        @if(editingId) {
                            <button type="submit" *appPermiso="{pantalla: 'CATALOGOS', accion: 'editar'}" [disabled]="catForm.invalid || isSaving" class="ucc-btn-primary w-full md:w-auto h-12">
                                @if(isSaving) {
                                    <span class="material-symbols-outlined animate-spin">sync</span>
                                    Guardando...
                                } @else {
                                    <span class="material-symbols-outlined">save</span>
                                    Guardar Cambios
                                }
                            </button>
                        } @else {
                            <button type="submit" *appPermiso="{pantalla: 'CATALOGOS', accion: 'crear'}" [disabled]="catForm.invalid || isSaving" class="ucc-btn-primary w-full md:w-auto h-12">
                                @if(isSaving) {
                                    <span class="material-symbols-outlined animate-spin">sync</span>
                                    Guardando...
                                } @else {
                                    <span class="material-symbols-outlined">save</span>
                                    Agregar
                                }
                            </button>
                        }
                    </form>
                </div>
            </div>

            <!-- Registers Table -->
            <div class="ucc-table-container">
                <div class="px-6 py-4 bg-ucc-secondary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 class="text-white font-bold flex items-center gap-2 text-body-lg">
                        <span class="material-symbols-outlined">list_alt</span>
                        {{ getTabNamePlural() }} Registrados
                    </h3>
                    <div class="flex items-center gap-4">
                        <span class="text-white/70 text-label-md">{{ listaActual.length }} REGISTROS EN TOTAL</span>
                        <button (click)="loadAllData()" class="p-1 hover:bg-white/10 rounded text-white transition-colors"><span class="material-symbols-outlined">refresh</span></button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="ucc-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre del {{ getTabName() }}</th>
                                @if(activeTab === 'tiposLicencia') {
                                    <th class="text-center">CANT. CONTRATADA</th>
                                    <th class="text-center">DISPONIBLES</th>
                                    <th class="text-center">VENCIMIENTO</th>
                                }
                                <th class="text-center">Estado</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(listaActual.length > 0) {
                                @for(item of listaActual; track item.id) {
                                    <tr>
                                        <td class="font-bold text-ucc-neutral-variant">{{item.id}}</td>
                                        <td class="font-semibold">{{item.nombre}}</td>
                                        @if(activeTab === 'tiposLicencia') {
                                            <td class="text-center font-medium">{{ item.cantidadContratada || 0 }}</td>
                                            <td class="text-center">
                                                <span [ngClass]="(item.disponibles || 0) <= 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">{{ item.disponibles || 0 }}</span>
                                            </td>
                                            <td class="text-center font-medium">
                                                @if(item.fechaVencimiento) {
                                                    <span [ngClass]="isExpired(item.fechaVencimiento) ? 'text-red-600 font-bold' : ''">{{ item.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                                                } @else {
                                                    <span class="text-ucc-neutral-variant italic">Perpetua</span>
                                                }
                                            </td>
                                        }
                                        <td class="text-center">
                                            <span class="inline-flex items-center px-3 py-1 rounded-full bg-ucc-primary-container/10 text-ucc-primary-container text-[11px] font-bold uppercase">Activo</span>
                                        </td>
                                        <td class="text-right">
                                            <div class="flex justify-end gap-2">
                                                <button *appPermiso="{pantalla: 'CATALOGOS', accion: 'editar'}" (click)="abrirDetalle(item)" class="p-2 text-ucc-primary hover:bg-ucc-primary/10 rounded-lg transition-colors" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                                                <button *appPermiso="{pantalla: 'CATALOGOS', accion: 'eliminar'}" (click)="delete(item.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                }
                            } @else {
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
                                            No hay catálogos registrados en el sistema.
                                        </p>
                                        </div>
                                    </td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right: Side Panel (Resumen & Historial) -->
        <div class="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
            <!-- Resumen de Configuración -->
            <div class="ucc-card">
                <h4 class="font-title-lg text-title-lg text-ucc-secondary mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-ucc-primary-container">dashboard_customize</span>
                    Resumen de Catálogos
                </h4>
                <div class="grid grid-cols-1 gap-4">
                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('ambientes')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">layers</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Ambientes</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ ambientesList.length || 0 }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('sitios')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">location_on</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Sitios</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ sitiosList.length || 0 }}</span>
                    </div>

                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('tiposHardware')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">devices</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Tipo de Hardware</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ tiposHardwareList.length || 0 }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('plataformas')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">cloud_done</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Plataformas</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ plataformasList.length || 0 }}</span>
                    </div>

                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('plataformasNombres')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">cloud</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Nombres de Plataformas</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ plataformasNombresList.length || 0 }}</span>
                    </div>

                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('tiposLicencia')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">key</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Tipos de Licencia</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ tiposLicenciaList.length || 0 }}</span>
                    </div>
                </div>
            </div>

            <!-- Historial de Cambios Recientes -->
            <div class="ucc-card">
                <h4 class="font-title-lg text-title-lg text-ucc-secondary mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-ucc-primary-container">history</span>
                    Cambios Recientes
                </h4>
                <div class="space-y-6">
                    <div class="flex gap-4 items-start border-l-2 border-ucc-primary-container/20 pl-4 relative">
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ucc-primary-container"></div>
                        <div>
                            <p class="text-body-md font-bold text-ucc-neutral-text leading-none">Catálogo Iniciado</p>
                            <p class="text-[12px] text-ucc-neutral-variant mt-1">Sincronización con BD establecida</p>
                            <p class="text-[10px] text-ucc-neutral-variant/60 mt-1 uppercase">Ahora</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  `
})
export class CatalogosComponent implements OnInit {

  isExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    return new Date(dateString).getTime() < new Date().setHours(0,0,0,0);
  }

  activeTab: 'ambientes' | 'sitios' | 'plataformas' | 'tiposHardware' | 'nivelesAcceso' | 'plataformasNombres' | 'tiposLicencia' = 'ambientes';

  ambientesList: Catalogo[] = [];
  tiposHardwareList: Catalogo[] = [];
  nivelesAccesoList: any[] = [];
  sitiosList: Catalogo[] = [];
  plataformasList: Catalogo[] = [];
  plataformasNombresList: Catalogo[] = [];
  tiposLicenciaList: Catalogo[] = [];

  catForm: FormGroup;
  isSaving = false;
  editingId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required],
      cantidadContratada: [0],
      fechaVencimiento: [null],
      puedeVer: [true],
      puedeCrear: [false],
      puedeEditar: [false],
      puedeEliminar: [false]
    });
  }

  get listaActual(): Catalogo[] {
    if (this.activeTab === 'ambientes') return this.ambientesList;
    if (this.activeTab === 'sitios') return this.sitiosList;
    if (this.activeTab === 'plataformas') return this.plataformasList;
    if (this.activeTab === 'tiposHardware') return this.tiposHardwareList;
    if (this.activeTab === 'nivelesAcceso') return this.nivelesAccesoList;
    if (this.activeTab === 'plataformasNombres') return this.plataformasNombresList;
    if (this.activeTab === 'tiposLicencia') return this.tiposLicenciaList;
    return [];
  }

  ngOnInit() {
    this.loadAllData();
  }

  setTab(tab: 'ambientes' | 'sitios' | 'plataformas' | 'tiposHardware' | 'nivelesAcceso' | 'plataformasNombres' | 'tiposLicencia') {
    this.activeTab = tab;
    this.catForm.reset();
    this.editingId = null;
  }

  getTabName(): string {
    if (this.activeTab === 'ambientes') return 'Ambiente';
    if (this.activeTab === 'sitios') return 'Sitio';
    if (this.activeTab === 'tiposHardware') return 'Tipo de Hardware';
    if (this.activeTab === 'nivelesAcceso') return 'Nivel de Acceso';
    if (this.activeTab === 'plataformasNombres') return 'Nombre de Plataforma';
    if (this.activeTab === 'tiposLicencia') return 'Tipo de Licencia';
    return 'Plataforma';
  }

  getTabNamePlural(): string {
    if (this.activeTab === 'ambientes') return 'Ambientes';
    if (this.activeTab === 'sitios') return 'Sitios';
    if (this.activeTab === 'tiposHardware') return 'Tipos de Hardware';
    if (this.activeTab === 'nivelesAcceso') return 'Niveles de Acceso';
    if (this.activeTab === 'plataformasNombres') return 'Nombres de Plataformas';
    if (this.activeTab === 'tiposLicencia') return 'Tipos de Licencia';
    return 'Plataformas';
  }

  getPlaceholder(): string {
    if (this.activeTab === 'ambientes') return 'Ej: Producción, Sandbox, QA...';
    if (this.activeTab === 'sitios') return 'Ej: Avatar, Intranet, SharePoint...';
    if (this.activeTab === 'tiposHardware') return 'Ej: Laptop, Desktop...';
    if (this.activeTab === 'nivelesAcceso') return 'Ej: Administrador, Solo Lectura...';
    if (this.activeTab === 'plataformasNombres') return 'Ej: Oracle, SAP...';
    if (this.activeTab === 'tiposLicencia') return 'Ej: Freemium, Premium...';
    return 'Ej: Moodle, O365, AWS...';
  }

  loadAllData() {
    this.api.getAmbientes().subscribe(res => this.ambientesList = res);
    this.api.getSitiosCat().subscribe(res => this.sitiosList = res);
    this.api.getPlataformasCat().subscribe(res => this.plataformasList = res);
    this.api.getNivelesAcceso().subscribe(res => this.nivelesAccesoList = res);
    this.api.getTiposHardware().subscribe(res => this.tiposHardwareList = res);
    this.api.getPlataformasNombres().subscribe(res => this.plataformasNombresList = res);
    this.api.getTiposLicencia().subscribe(res => this.tiposLicenciaList = res);
  }

  loadActiveTabData() {
    if (this.activeTab === 'ambientes') {
      this.api.getAmbientes().subscribe(res => this.ambientesList = res);
    } else if (this.activeTab === 'sitios') {
      this.api.getSitiosCat().subscribe(res => this.sitiosList = res);
    } else if (this.activeTab === 'plataformas') {
      this.api.getPlataformasCat().subscribe(res => this.plataformasList = res);
    } else if (this.activeTab === 'nivelesAcceso') {
      this.api.getNivelesAcceso().subscribe(res => this.nivelesAccesoList = res);
    } else if (this.activeTab === 'tiposHardware') {
      this.api.getTiposHardware().subscribe(res => this.tiposHardwareList = res);
    this.api.getPlataformasNombres().subscribe(res => this.plataformasNombresList = res);
    this.api.getTiposLicencia().subscribe(res => this.tiposLicenciaList = res);
    }
  }

  abrirDetalle(item: any) {
    console.log('Evento recibido:', item);

    if (!this.permissionService.tienePermiso('CATALOGOS', 'editar')) {
      console.warn('Acceso denegado - validación de seguridad fallida');
      return;
    }

    this.editingId = item.id;

    const request$ = this.activeTab === 'ambientes' ? this.api.getAmbiente(item.id) :
                     this.activeTab === 'sitios' ? this.api.getSitioCat(item.id) :
                     this.activeTab === 'tiposHardware' ? this.api.getTipoHardware(item.id) :
                     this.activeTab === 'plataformasNombres' ? this.api.getPlataformaNombre(item.id) :
                     this.activeTab === 'tiposLicencia' ? this.api.getTipoLicencia(item.id) :
                     this.api.getPlataformaCat(item.id);

    request$.subscribe({
      next: (data) => {
        this.catForm.patchValue({
          nombre: data.nombre,
          cantidadContratada: data.cantidadContratada || 0,
          fechaVencimiento: data.fechaVencimiento ? data.fechaVencimiento.split('T')[0] : null
        });
      },
      error: () => {
        this.editingId = null;
      }
    });
  }

  onSubmit() {
    this.catForm.markAllAsTouched();
    if (this.catForm.invalid) return;

    this.isSaving = true;
    const data = this.catForm.value;

    const request$ = this.editingId
      ? (this.activeTab === 'ambientes' ? this.api.updateAmbiente(this.editingId, data) :
         this.activeTab === 'sitios' ? this.api.updateSitioCat(this.editingId, data) :
         this.activeTab === 'tiposHardware' ? this.api.updateTipoHardware(this.editingId, data) :
         this.activeTab === 'nivelesAcceso' ? this.api.updateNivelAcceso(this.editingId, data) :
         this.activeTab === 'plataformasNombres' ? this.api.updatePlataformaNombre(this.editingId, data) :
         this.activeTab === 'tiposLicencia' ? this.api.updateTipoLicencia(this.editingId, data) :
         this.api.updatePlataformaCat(this.editingId, data))
      : (this.activeTab === 'ambientes' ? this.api.createAmbiente(data) :
         this.activeTab === 'sitios' ? this.api.createSitioCat(data) :
         this.activeTab === 'tiposHardware' ? this.api.createTipoHardware(data) :
         this.activeTab === 'nivelesAcceso' ? this.api.createNivelAcceso(data) :
         this.activeTab === 'plataformasNombres' ? this.api.createPlataformaNombre(data) :
         this.activeTab === 'tiposLicencia' ? this.api.createTipoLicencia(data) :
         this.api.createPlataformaCat(data));

    request$.subscribe({
      next: () => {
        setTimeout(() => {
          this.isSaving = false;
          this.loadActiveTabData();
          this.catForm.reset();
          this.editingId = null;
        }, 500);
      },
      error: () => {
        this.isSaving = false;
        alert('Error al guardar el catálogo. El nombre podría estar duplicado.');
      }
    });
  }

  delete(id: number) {
    if(confirm(`¿Está seguro de eliminar este registro del catálogo de ${this.getTabNamePlural()}?`)) {
      const request$ = this.activeTab === 'ambientes' ? this.api.deleteAmbiente(id) :
                       this.activeTab === 'sitios' ? this.api.deleteSitioCat(id) :
                       this.activeTab === 'tiposHardware' ? this.api.deleteTipoHardware(id) :
                       this.activeTab === 'nivelesAcceso' ? this.api.deleteNivelAcceso(id) :
                       this.activeTab === 'plataformasNombres' ? this.api.deletePlataformaNombre(id) :
                       this.activeTab === 'tiposLicencia' ? this.api.deleteTipoLicencia(id) :
                       this.api.deletePlataformaCat(id);

      request$.subscribe({
        next: () => {
            this.loadActiveTabData();
        },
        error: () => alert('Error al eliminar. Verifique dependencias en otros registros.')
      });
    }
  }
}
