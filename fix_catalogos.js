const fs = require('fs');

let content = fs.readFileSync('src/src/app/components/catalogos/catalogos.component.ts', 'utf8');

// Due to the regex replacement, the catalogos component got malformed HTML because it didn't match the same exact form structure.
// I will just restore catalogos.component.ts to its original structure but update the Tailwind classes.

const template = `
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
                    <button (click)="setTab('plataformas')" [ngClass]="activeTab === 'plataformas' ? 'bg-ucc-surface text-ucc-secondary font-bold border-b-2 border-ucc-primary-container' : 'text-ucc-neutral-variant hover:bg-ucc-neutral-outline/10'" class="px-6 py-3 rounded-t-lg transition-all text-body-md flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">cloud_done</span> Plataformas
                    </button>
                </div>

                <div class="p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="material-symbols-outlined text-ucc-primary-container p-2 bg-ucc-primary-container/10 rounded-lg">add_circle</span>
                        <h3 class="font-title-lg text-title-lg text-ucc-secondary">Registrar Nuevo {{ getTabName() }}</h3>
                    </div>

                    <form [formGroup]="catForm" (ngSubmit)="onSubmit()" class="flex flex-col md:flex-row gap-4 items-end">
                        <div class="flex-1 w-full">
                            <label class="block text-label-md text-ucc-neutral-variant mb-2 ml-1 uppercase">NOMBRE DEL {{ getTabName() }}</label>
                            <input formControlName="nombre" class="ucc-input" [placeholder]="getPlaceholder()" type="text"/>
                            @if(catForm.get('nombre')?.invalid && catForm.get('nombre')?.touched) {
                              <span class="text-ucc-error text-xs mt-1 block">El nombre es requerido.</span>
                            }
                        </div>
                        <button type="submit" [disabled]="catForm.invalid || isSaving" class="ucc-btn-primary w-full md:w-auto h-12">
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
            <div class="ucc-table-container">
                <div class="px-6 py-4 bg-ucc-secondary flex justify-between items-center">
                    <h3 class="text-white font-bold flex items-center gap-2 text-body-lg">
                        <span class="material-symbols-outlined">list_alt</span>
                        {{ getTabNamePlural() }} Registrados
                    </h3>
                    <div class="flex items-center gap-4">
                        <span class="text-white/70 text-label-md">{{ currentList.length }} REGISTROS EN TOTAL</span>
                        <button (click)="loadData()" class="p-1 hover:bg-white/10 rounded text-white transition-colors"><span class="material-symbols-outlined">refresh</span></button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="ucc-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre del {{ getTabName() }}</th>
                                <th class="text-center">Estado</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for(item of currentList; track item.id) {
                                <tr>
                                    <td class="font-bold text-ucc-neutral-variant">{{item.id}}</td>
                                    <td class="font-semibold">{{item.nombre}}</td>
                                    <td class="text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full bg-ucc-primary-container/10 text-ucc-primary-container text-[11px] font-bold uppercase">Activo</span>
                                    </td>
                                    <td class="text-right">
                                        <div class="flex justify-end gap-2">
                                            <button (click)="delete(item.id)" class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-lg transition-colors" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            } @empty {
                                <tr>
                                    <td colspan="4" class="p-6 text-center text-ucc-neutral-variant bg-ucc-surface">
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
                        <span class="text-xl font-bold text-ucc-secondary">{{ totalAmbientes }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('sitios')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">location_on</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Sitios</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ totalSitios }}</span>
                    </div>
                    <div class="p-4 rounded-lg bg-ucc-neutral-outline/10 border border-ucc-neutral-outline/20 flex justify-between items-center cursor-pointer hover:border-ucc-primary-container transition-colors" (click)="setTab('plataformas')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-ucc-secondary bg-ucc-secondary/10 p-2 rounded-lg">cloud_done</span>
                            <span class="font-body-md text-ucc-neutral-variant font-semibold">Plataformas</span>
                        </div>
                        <span class="text-xl font-bold text-ucc-secondary">{{ totalPlataformas }}</span>
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
`;

content = content.replace(/template: `[\s\S]*?`\n}\)/, `template: \`\n${template}\n\`\n})`);
fs.writeFileSync('src/src/app/components/catalogos/catalogos.component.ts', content);
