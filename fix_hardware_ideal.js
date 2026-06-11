const fs = require('fs');

const path = './src/src/app/components/hardware-ideal/hardware-ideal.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuestoRel" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroEquipo" placeholder="Filtrar Equipo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroProcesador" placeholder="Filtrar Procesador..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroMemoria" placeholder="Filtrar Memoria..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class HardwareIdealComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroPuestoRel: string = '';
  filtroEquipo: string = '';
  filtroProcesador: string = '';
  filtroMemoria: string = '';

  get listaFiltradaTabla() {
    return this.equiposIdeales.filter(hw => {
      const puestoNombre = this.getPuestoName(hw.puestoId);
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuestoRel.toLowerCase());
      const matchEquipo = hw.tipoEquipo?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ?? true;
      const matchProcesador = hw.procesador?.toLowerCase().includes(this.filtroProcesador.toLowerCase()) ?? true;
      const matchMemoria = hw.memoria?.toLowerCase().includes(this.filtroMemoria.toLowerCase()) ?? true;

      return matchPuesto && matchEquipo && matchProcesador && matchMemoria;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroPuestoRel = '';
    this.filtroEquipo = '';
    this.filtroProcesador = '';
    this.filtroMemoria = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class HardwareIdealComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.equiposIdeales
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.equiposIdeales\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.equiposIdeales\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('HardwareIdealComponent updated.');
