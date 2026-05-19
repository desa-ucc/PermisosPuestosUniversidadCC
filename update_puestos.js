const fs = require('fs');

let content = fs.readFileSync('src/src/app/components/puestos/puestos.component.ts', 'utf8');

const newTemplate = `
<main class="p-gutter max-w-container-max-width mx-auto space-y-8">
<!-- Heading -->
<div class="mb-8">
<h2 class="font-headline-lg text-headline-lg text-secondary">Gestión de Puestos</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
                Administre la jerarquía organizacional definiendo códigos, nombres y responsabilidades detalladas para cada posición operativa y administrativa.
            </p>
</div>
<div class="grid grid-cols-12 gap-gutter">
<!-- Registration & Table Section (Left + Center) -->
<div class="col-span-12 space-y-gutter">
<!-- Registration Card -->
<section class="bg-surface-container-lowest p-md rounded-xl card-shadow border border-outline-variant/20 !bg-white">
<div class="flex items-center gap-2 mb-6 text-secondary">
<span class="material-symbols-outlined" data-icon="add_circle">add_circle</span>
<h3 class="font-title-lg text-title-lg">Registrar Nuevo Puesto</h3>
</div>
<form [formGroup]="puestoForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">CÓDIGO</label>
<input formControlName="codigoPuesto" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all" placeholder="Ej: OPS-001" type="text"/>
@if(puestoForm.get('codigoPuesto')?.invalid && puestoForm.get('codigoPuesto')?.touched) {
  <span class="text-error text-xs mt-1 block">Requerido.</span>
}
</div>
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">NOMBRE DEL PUESTO</label>
<input formControlName="nombrePuesto" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all" placeholder="Nombre descriptivo" type="text"/>
@if(puestoForm.get('nombrePuesto')?.invalid && puestoForm.get('nombrePuesto')?.touched) {
  <span class="text-error text-xs mt-1 block">Requerido.</span>
}
</div>
<div class="space-y-2">
<label class="font-label-md text-label-md text-on-surface-variant block">DESCRIPCIÓN</label>
<input formControlName="descripcion" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all" placeholder="Breve resumen..." type="text"/>
</div>
<div class="flex flex-col items-center h-full pt-4 md:pt-0 gap-2">
<button type="submit" [disabled]="puestoForm.invalid" class="w-full bg-primary-container text-white font-bold px-6 py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
@if(isEditing) {
    <span class="material-symbols-outlined" data-icon="save">save</span>
    Actualizar Puesto
} @else {
    <span class="material-symbols-outlined" data-icon="add">add</span>
    Agregar Puesto
}
</button>
@if(isEditing) {
  <button type="button" (click)="resetForm()" class="w-full bg-surface-container-high text-on-surface-variant font-bold px-6 py-2 rounded-lg hover:brightness-105 transition-all">
    Cancelar
  </button>
}
</div>
</form>
</section>
<!-- Data Table -->
<section class="bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant/20 overflow-hidden !bg-white">
<div class="p-md flex justify-between items-center border-b border-outline-variant/20 bg-secondary">
<h3 class="font-title-lg text-title-lg text-white">Puestos Registrados</h3>
<button class="hover:bg-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/30 text-white">
<span class="material-symbols-outlined" data-icon="file_download">file_download</span>
<span class="font-label-md text-label-md">Exportar Listado</span>
</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-white border-b border-outline-variant/30 text-on-surface">
<th class="py-4 px-6 font-label-md text-label-md tracking-wider">ID</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Código</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Nombre</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider uppercase">Descripción</th>
<th class="py-4 px-6 font-label-md text-label-md tracking-wider text-center uppercase">Acciones</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/30">
@for(puesto of puestos; track puesto.id) {
<tr class="hover:bg-surface-container-low transition-colors">
<td class="py-4 px-6 font-code text-code text-on-surface-variant">{{puesto.id}}</td>
<td class="py-4 px-6 font-body-md text-body-md font-bold">{{puesto.codigoPuesto}}</td>
<td class="py-4 px-6 font-body-md text-body-md">{{puesto.nombrePuesto}}</td>
<td class="py-4 px-6 font-body-md text-body-md text-on-surface-variant truncate max-w-xs">{{puesto.descripcion || 'N/A'}}</td>
<td class="py-4 px-6">
<div class="flex justify-center gap-3">
<button (click)="edit(puesto)" class="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-all" title="Editar">
<span class="material-symbols-outlined" data-icon="edit">edit</span>
</button>
<button (click)="delete(puesto.id)" class="p-2 text-error hover:bg-error/10 rounded-full transition-all" title="Eliminar">
<span class="material-symbols-outlined" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>
} @empty {
<tr>
<td colspan="5" class="py-8 px-6 text-center font-body-md text-on-surface-variant">No hay puestos registrados en el sistema.</td>
</tr>
}
</tbody>
</table>
</div>
<div class="p-4 bg-surface-container-low flex justify-between items-center text-on-surface-variant">
<p class="font-label-md text-label-md">Mostrando {{puestos.length}} puestos registrados</p>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-highest transition-all disabled:opacity-50" disabled><span class="material-symbols-outlined text-[18px]" data-icon="chevron_left">chevron_left</span></button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-secondary text-on-secondary font-bold text-xs">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-highest transition-all disabled:opacity-50" disabled><span class="material-symbols-outlined text-[18px]" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-8">
<!-- Resumen de Puestos -->
<div class="bg-surface-container-low p-8 rounded-xl card-shadow border border-outline-variant/20">
<h3 class="font-title-lg text-title-lg text-secondary mb-6">Resumen de Puestos</h3>
<div class="space-y-4">
<div class="flex items-center justify-between p-6 bg-secondary-container/20 rounded-lg">
<div class="flex items-center gap-3">
<div class="p-2 bg-secondary/10 rounded-lg text-secondary"><span class="material-symbols-outlined">assessment</span></div>
<span class="font-body-md text-body-md text-secondary font-bold">Total Puestos</span>
</div>
<span class="font-headline-md text-headline-md text-secondary">{{puestos.length}}</span>
</div>
<div class="flex items-center justify-between p-6 bg-primary-container/10 rounded-lg">
<div class="flex items-center gap-3">
<div class="p-2 bg-primary-container/10 rounded-lg text-primary"><span class="material-symbols-outlined">check_circle</span></div>
<span class="font-body-md text-body-md text-primary font-bold">Puestos Activos</span>
</div>
<span class="font-headline-md text-headline-md text-primary">{{puestos.length}}</span>
</div>
</div>
<button class="w-full mt-6 py-2 text-center text-secondary font-bold font-label-md text-label-md border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-all">Ver Reporte Detallado</button>
</div>
<!-- Cambios Recientes -->
<div class="bg-surface-container-low p-md rounded-xl card-shadow border border-outline-variant/20">
<h3 class="font-title-lg text-title-lg text-secondary mb-6">Cambios Recientes</h3>
<div class="space-y-6">
<div class="flex gap-4">
<div class="relative">
<div class="w-8 h-8 bg-primary-container/20 rounded-full flex items-center justify-center text-primary-container"><span class="material-symbols-outlined text-[18px]">add</span></div>
<div class="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-outline-variant/30"></div>
</div>
<div>
<p class="font-label-md text-label-md font-bold">Base de Datos</p>
<p class="text-[11px] text-on-surface-variant">Sincronizado</p>
<p class="text-[10px] text-on-surface-variant/60 mt-1 uppercase">Ahora</p>
</div>
</div>
</div>
</div>
<!-- Contextual Tip -->
<div class="bg-secondary p-6 rounded-xl text-on-secondary relative overflow-hidden flex flex-col justify-center">
<div class="absolute -right-4 -bottom-4 opacity-10">
<span class="material-symbols-outlined text-[120px]">lightbulb</span>
</div>
<h4 class="font-label-md text-label-md font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">info</span>Tip de Administración</h4>
<p class="text-xs leading-relaxed text-on-secondary/80">Mantener los códigos de puesto estandarizados (Ej: DEPT-NUM) facilita la integración con el sistema de nómina y la asignación de hardware.</p>
</div>
</div>
</div>
</div>
</main>
`;

const updatedContent = content.replace(/template: `[\s\S]*?`\n}\)/, `template: \`\n${newTemplate}\n\`\n})`);

fs.writeFileSync('src/src/app/components/puestos/puestos.component.ts', updatedContent);
