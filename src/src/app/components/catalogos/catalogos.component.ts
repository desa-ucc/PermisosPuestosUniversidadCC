import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Catalogo } from '../../models/models';

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="p-gutter max-w-container-max-width mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col gap-1 mb-8 mt-4">
        <h2 class="font-headline-lg text-headline-lg text-secondary">Gestión de Catálogos Base</h2>
        <p class="text-body-md text-on-surface-variant">Configura y administra los parámetros fundamentales del ecosistema institucional.</p>
    </div>

    <div class="grid grid-cols-12 gap-gutter items-start">
        <!-- Left: Form & Table -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
            <!-- Integrated Category Tabs & Add Form -->
            <div class="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
                <!-- Tabs Integrated here -->
                <div class="flex border-b border-outline-variant/30 p-1 bg-surface-container-low/30">
                    <button (click)="setTab('ambientes')" [ngClass]="activeTab === 'ambientes' ? 'bg-surface-container-lowest text-secondary font-bold border-b-2 border-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">layers</span> Ambientes
                    </button>
                    <button (click)="setTab('sitios')" [ngClass]="activeTab === 'sitios' ? 'bg-surface-container-lowest text-secondary font-bold border-b-2 border-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">location_on</span> Sitios
                    </button>
                    <button (click)="setTab('plataformas')" [ngClass]="activeTab === 'plataformas' ? 'bg-surface-container-lowest text-secondary font-bold border-b-2 border-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">cloud_done</span> Plataformas
                    </button>
                </div>

                <div class="p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="material-symbols-outlined text-primary-container p-2 bg-primary-container/10 rounded-lg">add_circle</span>
                        <h3 class="font-title-lg text-title-lg text-secondary">Registrar Nuevo {{ getTabName() }}</h3>
                    </div>

                    <form [formGroup]="catForm" (ngSubmit)="onSubmit()" class="flex flex-col md:flex-row gap-4 items-end">
                        <div class="flex-1 w-full">
                            <label class="block text-label-md text-on-surface-variant mb-2 ml-1 uppercase">NOMBRE DEL {{ getTabName() }}</label>
                            <input formControlName="nombre" class="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all" [placeholder]="getPlaceholder()" type="text"/>
                            @if(catForm.get('nombre')?.invalid && catForm.get('nombre')?.touched) {
                              <span class="text-red-400 text-xs mt-1 block">El nombre es requerido.</span>
                            }
                        </div>
                        <button type="submit" [disabled]="catForm.invalid || isSaving" class="w-full md:w-auto px-8 py-3 bg-primary-container hover:opacity-90 text-primary-fixed font-bold rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            @if(isSaving) {
                                <span class="material-symbols-outlined animate-spin">sync</span>
                                Guardando...
                            } @else {
                                <span class="material-symbols-outlined">save</span>
                                Agregar
                            }
                        </button>
                    </form>
                </div>
            </div>

            <!-- Registers Table -->
            <div class="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/30">
                <div class="px-6 py-4 bg-secondary flex justify-between items-center">
                    <h3 class="text-on-secondary font-bold flex items-center gap-2 text-body-lg">
                        <span class="material-symbols-outlined">list_alt</span>
                        {{ getTabNamePlural() }} Registrados
                    </h3>
                    <div class="flex items-center gap-4">
                        <span class="text-on-secondary/70 text-label-md">{{ currentList.length }} REGISTROS EN TOTAL</span>
                        <button (click)="loadData()" class="p-1 hover:bg-on-secondary/10 rounded text-on-secondary transition-colors"><span class="material-symbols-outlined">refresh</span></button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low/50 border-b border-outline-variant/30">
                                <th class="px-6 py-4 text-left text-secondary uppercase tracking-wider font-semibold text-[11px]">ID</th>
                                <th class="px-6 py-4 text-left text-secondary uppercase tracking-wider font-semibold text-[11px]">Nombre del {{ getTabName() }}</th>
                                <th class="px-6 py-4 text-center text-secondary uppercase tracking-wider font-semibold text-[11px]">Estado</th>
                                <th class="px-6 py-4 text-right text-secondary uppercase tracking-wider font-semibold text-[11px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-outline-variant/30">
                            @for(item of currentList; track item.id) {
                                <tr class="hover:bg-surface-container-low transition-colors">
                                    <td class="px-6 py-5 text-body-md font-bold text-on-surface-variant">{{item.id}}</td>
                                    <td class="px-6 py-5 text-body-md text-on-surface font-semibold">{{item.nombre}}</td>
                                    <td class="px-6 py-5 text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/10 text-primary-container text-[11px] font-bold uppercase">Activo</span>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <div class="flex justify-end gap-2">
                                            <button (click)="delete(item.id)" class="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            } @empty {
                                <tr>
                                    <td colspan="4" class="p-6 text-center text-on-surface-variant bg-surface-container-lowest">
                                        No hay elementos registrados en este catálogo.
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
            <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                <h4 class="font-title-lg text-title-lg text-secondary mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary-container">dashboard_customize</span>
                    Resumen de Catálogos
                </h4>
                <div class="grid grid-cols-1 gap-4">
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center cursor-pointer hover:border-primary-container transition-colors" (click)="setTab('ambientes')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">layers</span>
                            <span class="font-body-md text-on-surface-variant font-semibold">Ambientes</span>
                        </div>
                        <span class="text-xl font-bold text-secondary">{{ totalAmbientes }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center cursor-pointer hover:border-primary-container transition-colors" (click)="setTab('sitios')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">location_on</span>
                            <span class="font-body-md text-on-surface-variant font-semibold">Sitios</span>
                        </div>
                        <span class="text-xl font-bold text-secondary">{{ totalSitios }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center cursor-pointer hover:border-primary-container transition-colors" (click)="setTab('plataformas')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">cloud_done</span>
                            <span class="font-body-md text-on-surface-variant font-semibold">Plataformas</span>
                        </div>
                        <span class="text-xl font-bold text-secondary">{{ totalPlataformas }}</span>
                    </div>
                </div>
            </div>

            <!-- Historial de Cambios Recientes -->
            <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
                <h4 class="font-title-lg text-title-lg text-secondary mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary-container">history</span>
                    Cambios Recientes
                </h4>
                <div class="space-y-6">
                    <div class="flex gap-4 items-start border-l-2 border-primary-container/20 pl-4 relative">
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-container"></div>
                        <div>
                            <p class="text-body-md font-bold text-on-surface leading-none">Catálogo Iniciado</p>
                            <p class="text-[12px] text-on-surface-variant mt-1">Sincronización con BD establecida</p>
                            <p class="text-[10px] text-on-surface-variant/60 mt-1 uppercase">Ahora</p>
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
  activeTab: 'ambientes' | 'sitios' | 'plataformas' = 'ambientes';
  currentList: Catalogo[] = [];
  catForm: FormGroup;
  isSaving = false;

  totalAmbientes = 0;
  totalSitios = 0;
  totalPlataformas = 0;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAllTotals();
    this.loadData();
  }

  setTab(tab: 'ambientes' | 'sitios' | 'plataformas') {
    this.activeTab = tab;
    this.catForm.reset();
    this.loadData();
  }

  getTabName(): string {
    if (this.activeTab === 'ambientes') return 'Ambiente';
    if (this.activeTab === 'sitios') return 'Sitio';
    return 'Plataforma';
  }

  getTabNamePlural(): string {
    if (this.activeTab === 'ambientes') return 'Ambientes';
    if (this.activeTab === 'sitios') return 'Sitios';
    return 'Plataformas';
  }

  getPlaceholder(): string {
    if (this.activeTab === 'ambientes') return 'Ej: Producción, Sandbox, QA...';
    if (this.activeTab === 'sitios') return 'Ej: Avatar, Intranet, SharePoint...';
    return 'Ej: Moodle, O365, AWS...';
  }

  loadAllTotals() {
    this.api.getAmbientes().subscribe(res => this.totalAmbientes = res.length);
    this.api.getSitiosCat().subscribe(res => this.totalSitios = res.length);
    this.api.getPlataformasCat().subscribe(res => this.totalPlataformas = res.length);
  }

  loadData() {
    if (this.activeTab === 'ambientes') {
      this.api.getAmbientes().subscribe(res => { this.currentList = res; this.totalAmbientes = res.length; });
    } else if (this.activeTab === 'sitios') {
      this.api.getSitiosCat().subscribe(res => { this.currentList = res; this.totalSitios = res.length; });
    } else if (this.activeTab === 'plataformas') {
      this.api.getPlataformasCat().subscribe(res => { this.currentList = res; this.totalPlataformas = res.length; });
    }
  }

  onSubmit() {
    this.catForm.markAllAsTouched();
    if (this.catForm.invalid) return;

    this.isSaving = true;
    const data = this.catForm.value;

    const request$ = this.activeTab === 'ambientes' ? this.api.createAmbiente(data) :
                     this.activeTab === 'sitios' ? this.api.createSitioCat(data) :
                     this.api.createPlataformaCat(data);

    request$.subscribe({
      next: () => {
        // Simulate a slight delay to show the nice animation for saving
        setTimeout(() => {
          this.isSaving = false;
          this.loadData();
          this.loadAllTotals();
          this.catForm.reset();
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
                       this.api.deletePlataformaCat(id);

      request$.subscribe({
        next: () => {
            this.loadData();
            this.loadAllTotals();
        },
        error: () => alert('Error al eliminar. Verifique dependencias en otros registros.')
      });
    }
  }
}
