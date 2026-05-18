import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Empleado, Puesto } from '../../models/models';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Gestión de Colaboradores</h2>

      <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-4 rounded mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input formControlName="codigoEmpleado" placeholder="Código Empleado" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="nombreCompleto" placeholder="Nombre Completo" class="p-2 rounded bg-gray-700 text-white">
          <input formControlName="correoInstitucional" placeholder="Correo" type="email" class="p-2 rounded bg-gray-700 text-white">
          <select formControlName="puestoId" class="p-2 rounded bg-gray-700 text-white">
            <option value="">Seleccione Puesto</option>
            <option *ngFor="let p of puestos" [value]="p.id">{{p.nombrePuesto}}</option>
          </select>
        </div>
        <button type="submit" [disabled]="empleadoForm.invalid" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {{ isEditing ? 'Actualizar' : 'Agregar' }}
        </button>
        <button type="button" *ngIf="isEditing" (click)="resetForm()" class="mt-4 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </form>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2 border border-gray-600">Código</th>
            <th class="p-2 border border-gray-600">Nombre</th>
            <th class="p-2 border border-gray-600">Correo</th>
            <th class="p-2 border border-gray-600">Puesto</th>
            <th class="p-2 border border-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let emp of empleados" class="bg-gray-800 hover:bg-gray-700">
            <td class="p-2 border border-gray-600">{{emp.codigoEmpleado}}</td>
            <td class="p-2 border border-gray-600">{{emp.nombreCompleto}}</td>
            <td class="p-2 border border-gray-600">{{emp.correoInstitucional}}</td>
            <td class="p-2 border border-gray-600">{{emp.nombrePuesto || 'N/A'}}</td>
            <td class="p-2 border border-gray-600">
              <button (click)="edit(emp)" class="text-blue-400 mr-2 hover:text-blue-300">Editar</button>
              <button (click)="delete(emp.id)" class="text-red-400 hover:text-red-300">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ColaboradoresComponent implements OnInit {
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];
  empleadoForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.empleadoForm = this.fb.group({
      codigoEmpleado: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      correoInstitucional: ['', [Validators.required, Validators.email]],
      puestoId: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  onSubmit() {
    if (this.empleadoForm.invalid) return;

    const data = this.empleadoForm.value;
    data.puestoId = data.puestoId ? Number(data.puestoId) : null;

    if (this.isEditing && this.currentId) {
      this.api.updateEmpleado(this.currentId, { ...data, id: this.currentId }).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    } else {
      this.api.createEmpleado(data).subscribe(() => {
        this.loadData();
        this.resetForm();
      });
    }
  }

  edit(emp: Empleado) {
    this.isEditing = true;
    this.currentId = emp.id;
    this.empleadoForm.patchValue(emp);
  }

  delete(id: number) {
    if(confirm('¿Eliminar empleado?')) {
      this.api.deleteEmpleado(id).subscribe(() => this.loadData());
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentId = null;
    this.empleadoForm.reset();
  }
}
