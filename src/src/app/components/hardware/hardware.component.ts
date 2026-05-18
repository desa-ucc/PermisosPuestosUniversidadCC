import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HardwareAsignado, Empleado } from '../../models/models';

@Component({
  selector: 'app-hardware',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Hardware Asignado</h2>

      <form [formGroup]="hwForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select formControlName="empleadoId" class="p-2 rounded bg-gray-700 text-white">
            <option value="">Seleccione Empleado</option>
            <option *ngFor="let emp of empleados" [value]="emp.id">{{emp.nombreCompleto}}</option>
          </select>
          <input formControlName="placa" placeholder="Placa de Activo" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="tipoEquipo" placeholder="Tipo Equipo (ej. Laptop)" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="procesador" placeholder="Procesador" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="memoria" placeholder="Memoria RAM" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="disco" placeholder="Disco Duro" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="marcaPC" placeholder="Marca" class="p-2 rounded bg-gray-700 text-white">
          <label class="flex items-center text-white">
            <input type="checkbox" formControlName="tecladoNumerico" class="mr-2"> Teclado Numérico
          </label>
          <input formControlName="otrasConsideraciones" placeholder="Otras Consideraciones" class="p-2 rounded bg-gray-700 text-white lg:col-span-3">
        </div>
        <button type="submit" [disabled]="hwForm.invalid" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {{ isEditing ? 'Actualizar' : 'Agregar' }}
        </button>
        <button type="button" *ngIf="isEditing" (click)="resetForm()" class="mt-4 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </form>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2 border border-gray-600">Placa</th>
            <th class="p-2 border border-gray-600">Empleado</th>
            <th class="p-2 border border-gray-600">Equipo</th>
            <th class="p-2 border border-gray-600">Marca</th>
            <th class="p-2 border border-gray-600">Specs</th>
            <th class="p-2 border border-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let hw of equipos" class="bg-gray-800 hover:bg-gray-700">
            <td class="p-2 border border-gray-600">{{hw.placa}}</td>
            <td class="p-2 border border-gray-600">{{getEmpleadoName(hw.empleadoId)}}</td>
            <td class="p-2 border border-gray-600">{{hw.tipoEquipo}}</td>
            <td class="p-2 border border-gray-600">{{hw.marcaPC}}</td>
            <td class="p-2 border border-gray-600">{{hw.procesador}}, {{hw.memoria}}, {{hw.disco}}</td>
            <td class="p-2 border border-gray-600">
              <button (click)="edit(hw)" class="text-blue-400 mr-2 hover:text-blue-300">Editar</button>
              <button (click)="delete(hw.id)" class="text-red-400 hover:text-red-300">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class HardwareComponent implements OnInit {
  equipos: HardwareAsignado[] = [];
  empleados: Empleado[] = [];
  hwForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.hwForm = this.fb.group({
      empleadoId: ['', Validators.required],
      tipoEquipo: ['', Validators.required],
      procesador: ['', Validators.required],
      memoria: ['', Validators.required],
      disco: ['', Validators.required],
      marcaPC: ['', Validators.required],
      tecladoNumerico: [false],
      otrasConsideraciones: [''],
      placa: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getHardwareAsignado().subscribe(res => this.equipos = res);
    this.api.getEmpleados().subscribe(res => this.empleados = res);
  }

  getEmpleadoName(id: number): string {
    return this.empleados.find(e => e.id === id)?.nombreCompleto || 'Desconocido';
  }

  onSubmit() {
    if (this.hwForm.invalid) return;

    const data = this.hwForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateHardwareAsignado(this.currentId, { ...data, id: this.currentId }).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    } else {
      this.api.createHardwareAsignado(data).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    }
  }

  edit(hw: HardwareAsignado) {
    this.isEditing = true;
    this.currentId = hw.id;
    this.hwForm.patchValue(hw);
  }

  delete(id: number) {
    if(confirm('¿Eliminar equipo asignado?')) {
      this.api.deleteHardwareAsignado(id).subscribe(() => this.loadData());
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.hwForm.reset();
  }
}
