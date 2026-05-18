import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SoftwareLocal, HardwareAsignado } from '../../models/models';

@Component({
  selector: 'app-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Software Local</h2>

      <form [formGroup]="swForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select formControlName="empleadoId" class="p-2 rounded bg-gray-700 text-white">
            <option value="">Seleccione Equipo/Empleado</option>
            <option *ngFor="let eq of equipos" [value]="eq.empleadoId">{{eq.placa}} - {{eq.marcaPC}}</option>
          </select>
          <input formControlName="equipo" placeholder="Nombre Equipo en Red" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="gruposAD" placeholder="Grupos AD" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="nombreSoftware" placeholder="Nombre Software" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="version" placeholder="Versión" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="fabricante" placeholder="Fabricante" class="p-2 rounded bg-gray-700 text-white">
        </div>
        <button type="submit" [disabled]="swForm.invalid" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {{ isEditing ? 'Actualizar' : 'Agregar' }}
        </button>
        <button type="button" *ngIf="isEditing" (click)="resetForm()" class="mt-4 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </form>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2 border border-gray-600">Empleado/Equipo</th>
            <th class="p-2 border border-gray-600">Software</th>
            <th class="p-2 border border-gray-600">Versión</th>
            <th class="p-2 border border-gray-600">Fabricante</th>
            <th class="p-2 border border-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let sw of softwareList" class="bg-gray-800 hover:bg-gray-700">
            <td class="p-2 border border-gray-600">{{getEquipoPlaca(sw.empleadoId)}}</td>
            <td class="p-2 border border-gray-600">{{sw.nombreSoftware}}</td>
            <td class="p-2 border border-gray-600">{{sw.version}}</td>
            <td class="p-2 border border-gray-600">{{sw.fabricante}}</td>
            <td class="p-2 border border-gray-600">
              <button (click)="edit(sw)" class="text-blue-400 mr-2 hover:text-blue-300">Editar</button>
              <button (click)="delete(sw.id)" class="text-red-400 hover:text-red-300">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class SoftwareComponent implements OnInit {
  softwareList: SoftwareLocal[] = [];
  equipos: HardwareAsignado[] = [];
  swForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.swForm = this.fb.group({
      empleadoId: ['', Validators.required],
      equipo: ['', Validators.required],
      gruposAD: ['', Validators.required],
      nombreSoftware: ['', Validators.required],
      version: ['', Validators.required],
      fabricante: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getSoftwareLocales().subscribe(res => this.softwareList = res);
    this.api.getHardwareAsignado().subscribe(res => this.equipos = res);
  }

  getEquipoPlaca(empleadoId: number): string {
    return this.equipos.find(e => e.empleadoId === empleadoId)?.placa || 'Desconocido';
  }

  onSubmit() {
    if (this.swForm.invalid) return;

    const data = this.swForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateSoftwareLocal(this.currentId, { ...data, id: this.currentId }).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    } else {
      this.api.createSoftwareLocal(data).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    }
  }

  edit(sw: SoftwareLocal) {
    this.isEditing = true;
    this.currentId = sw.id;
    this.swForm.patchValue(sw);
  }

  delete(id: number) {
    if(confirm('¿Eliminar registro de software?')) {
      this.api.deleteSoftwareLocal(id).subscribe(() => this.loadData());
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.swForm.reset();
  }
}
