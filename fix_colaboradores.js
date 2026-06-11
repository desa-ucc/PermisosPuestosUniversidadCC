const fs = require('fs');

const path = './src/src/app/components/colaboradores/colaboradores.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroCodigo" placeholder="Filtrar Código..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroNombre" placeholder="Filtrar Nombre..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroCorreo" placeholder="Filtrar Correo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuestoTabla" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class ColaboradoresComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroCodigo: string = '';
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroPuestoTabla: string = '';

  get empleadosFiltradosTabla() {
    return this.empleados.filter(emp => {
      const matchCodigo = emp.codigoEmpleado?.toLowerCase().includes(this.filtroCodigo.toLowerCase()) ?? true;
      const matchNombre = emp.nombreCompleto?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ?? true;
      const matchCorreo = emp.correoInstitucional?.toLowerCase().includes(this.filtroCorreo.toLowerCase()) ?? true;
      const matchPuesto = (emp.nombrePuesto || 'No Asignado').toLowerCase().includes(this.filtroPuestoTabla.toLowerCase());

      return matchCodigo && matchNombre && matchCorreo && matchPuesto;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroCodigo = '';
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroPuestoTabla = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class ColaboradoresComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.empleados
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.empleados\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.empleadosFiltradosTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.empleados\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.empleadosFiltradosTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Colaboradores Component updated.');
