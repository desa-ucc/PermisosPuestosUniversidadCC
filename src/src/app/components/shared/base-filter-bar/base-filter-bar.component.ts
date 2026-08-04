import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterColumn {
  field: string;
  placeholder: string;
  type: 'text' | 'select';
  options?: any[]; // For select type, array of objects {id, nombre} or {nombre, nombre} depending on what is stored
  optionValueKey?: string; // which property of option to use as value
  optionLabelKey?: string; // which property of option to show to user
}

@Component({
  selector: 'app-base-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
      <span class="material-symbols-outlined text-ucc-neutral-variant mr-2">filter_list</span>

      @for (col of config; track col.field) {
        @if (col.type === 'text') {
          <input type="text"
                 [(ngModel)]="filters[col.field]"
                 (input)="onFilterChange()"
                 [placeholder]="col.placeholder"
                 class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
        } @else if (col.type === 'select') {
          <select [(ngModel)]="filters[col.field]"
                  (change)="onFilterChange()"
                  class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">
            <option value="">-- {{ col.placeholder }} --</option>
            @for (opt of col.options; track $index) {
              <option [value]="opt[col.optionValueKey || 'nombre']">{{ opt[col.optionLabelKey || 'nombre'] }}</option>
            }
          </select>
        }
      }


      <div class="ml-auto flex items-center gap-3">
        @if (showExportButton) {
          <button (click)="onExport()" class="bg-ucc-primary text-white hover:bg-ucc-primary/90 px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">download</span> Generar Reporte</button>
        }
        <button (click)="clearFilters()" class="flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
          <span class="material-symbols-outlined text-[18px]">refresh</span> Limpiar Filtros
        </button>
      </div>
    </div>
  `

})
export class BaseFilterBarComponent implements OnChanges {

  @Input() config: FilterColumn[] = [];
  @Input() initialFilters: any = {};
  @Input() showExportButton: boolean = false;
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() exportData = new EventEmitter<void>();


  filters: any = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialFilters'] && changes['initialFilters'].currentValue) {
      this.filters = { ...this.initialFilters };
    }
  }

  onFilterChange() {
    this.filtersChanged.emit({ ...this.filters });
  }

  onExport() {
    this.exportData.emit();
  }

  clearFilters() {
    // Reset all filter fields to empty string
    for (const key in this.filters) {
      this.filters[key] = '';
    }
    this.filtersCleared.emit();
  }
}
