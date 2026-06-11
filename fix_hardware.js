const fs = require('fs');

const path = './src/src/app/components/hardware/hardware.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuesto" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroEmpleado" placeholder="Filtrar Persona..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroEquipo" placeholder="Filtrar Equipo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroMarca" placeholder="Filtrar Marca..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPlaca" placeholder="Filtrar Placa..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class HardwareComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroPuesto: string = '';
  filtroEmpleado: string = '';
  filtroEquipo: string = '';
  filtroMarca: string = '';
  filtroPlaca: string = '';

  get listaFiltradaTabla() {
    return this.equipos.filter(hw => {
      const puestoNombre = this.getPuestoByEmpleado(hw.empleadoId);
      const empleadoNombre = this.getEmpleadoName(hw.empleadoId);

      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchEmpleado = empleadoNombre.toLowerCase().includes(this.filtroEmpleado.toLowerCase());
      const matchEquipo = hw.tipoEquipo?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ?? true;
      const matchMarca = hw.marcaPC?.toLowerCase().includes(this.filtroMarca.toLowerCase()) ?? true;
      const matchPlaca = hw.placa?.toLowerCase().includes(this.filtroPlaca.toLowerCase()) ?? true;

      return matchPuesto && matchEmpleado && matchEquipo && matchMarca && matchPlaca;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroPuesto = '';
    this.filtroEmpleado = '';
    this.filtroEquipo = '';
    this.filtroMarca = '';
    this.filtroPlaca = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class HardwareComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.equipos
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.equipos\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.equipos\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('HardwareComponent updated.');
