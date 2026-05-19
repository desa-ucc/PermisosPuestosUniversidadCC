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
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Catálogos Base</h2>

      <div class="flex gap-4 mb-6">
        <button (click)="setTab('ambientes')" [ngClass]="{'bg-blue-600': activeTab === 'ambientes', 'bg-gray-700': activeTab !== 'ambientes'}" class="px-4 py-2 rounded text-white font-semibold transition hover:bg-blue-500">Ambientes</button>
        <button (click)="setTab('sitios')" [ngClass]="{'bg-blue-600': activeTab === 'sitios', 'bg-gray-700': activeTab !== 'sitios'}" class="px-4 py-2 rounded text-white font-semibold transition hover:bg-blue-500">Sitios</button>
        <button (click)="setTab('plataformas')" [ngClass]="{'bg-blue-600': activeTab === 'plataformas', 'bg-gray-700': activeTab !== 'plataformas'}" class="px-4 py-2 rounded text-white font-semibold transition hover:bg-blue-500">Plataformas</button>
      </div>

      <form [formGroup]="catForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6 flex items-end gap-4">
        <div class="flex flex-col flex-1">
          <label class="text-gray-300 mb-1 font-semibold">Agregar {{activeTab | titlecase}}</label>
          <input formControlName="nombre" placeholder="Nombre" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
          @if(catForm.get('nombre')?.invalid && catForm.get('nombre')?.touched) {
            <span class="text-red-400 text-xs mt-1">El nombre es requerido.</span>
          }
        </div>
        <button type="submit" [disabled]="catForm.invalid" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-10">
          Agregar
        </button>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse rounded-lg overflow-hidden md:w-1/2">
          <thead>
            <tr class="bg-gray-700 text-gray-200">
              <th class="p-3 border-b border-gray-600 font-semibold">ID</th>
              <th class="p-3 border-b border-gray-600 font-semibold">Nombre</th>
              <th class="p-3 border-b border-gray-600 font-semibold text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for(item of currentList; track item.id) {
              <tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">
                <td class="p-3 text-gray-400">{{item.id}}</td>
                <td class="p-3">{{item.nombre}}</td>
                <td class="p-3 text-center">
                  <button (click)="delete(item.id)" class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="p-6 text-center text-gray-400 bg-gray-800">
                  No hay elementos registrados en este catálogo.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CatalogosComponent implements OnInit {
  activeTab: 'ambientes' | 'sitios' | 'plataformas' = 'ambientes';
  currentList: Catalogo[] = [];
  catForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: 'ambientes' | 'sitios' | 'plataformas') {
    this.activeTab = tab;
    this.catForm.reset();
    this.loadData();
  }

  loadData() {
    if (this.activeTab === 'ambientes') {
      this.api.getAmbientes().subscribe(res => this.currentList = res);
    } else if (this.activeTab === 'sitios') {
      this.api.getSitiosCat().subscribe(res => this.currentList = res);
    } else if (this.activeTab === 'plataformas') {
      this.api.getPlataformasCat().subscribe(res => this.currentList = res);
    }
  }

  onSubmit() {
    this.catForm.markAllAsTouched();
    if (this.catForm.invalid) return;

    const data = this.catForm.value;

    if (this.activeTab === 'ambientes') {
      this.api.createAmbiente(data).subscribe(() => this.loadAfterAdd());
    } else if (this.activeTab === 'sitios') {
      this.api.createSitioCat(data).subscribe(() => this.loadAfterAdd());
    } else if (this.activeTab === 'plataformas') {
      this.api.createPlataformaCat(data).subscribe(() => this.loadAfterAdd());
    }
  }

  loadAfterAdd() {
    this.loadData();
    this.catForm.reset();
  }

  delete(id: number) {
    if(confirm('¿Está seguro de eliminar este registro del catálogo?')) {
      if (this.activeTab === 'ambientes') {
        this.api.deleteAmbiente(id).subscribe(() => this.loadData());
      } else if (this.activeTab === 'sitios') {
        this.api.deleteSitioCat(id).subscribe(() => this.loadData());
      } else if (this.activeTab === 'plataformas') {
        this.api.deletePlataformaCat(id).subscribe(() => this.loadData());
      }
    }
  }
}
