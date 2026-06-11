const fs = require('fs');

const path = './src/src/app/components/software/software.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroEquipo" placeholder="Filtrar Equipo..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroSoftware" placeholder="Filtrar Software..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroVersion" placeholder="Filtrar Versión..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroFabricante" placeholder="Filtrar Fabricante..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class SoftwareComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroEquipo: string = '';
  filtroSoftware: string = '';
  filtroVersion: string = '';
  filtroFabricante: string = '';

  get listaFiltradaTabla() {
    return this.softwareList.filter(sw => {
      const equipoNombre = this.getEquipoPlaca(sw.empleadoId);

      const matchEquipo = equipoNombre.toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const matchSoftware = sw.nombreSoftware?.toLowerCase().includes(this.filtroSoftware.toLowerCase()) ?? true;
      const matchVersion = sw.version?.toLowerCase().includes(this.filtroVersion.toLowerCase()) ?? true;
      const matchFabricante = sw.fabricante?.toLowerCase().includes(this.filtroFabricante.toLowerCase()) ?? true;

      return matchEquipo && matchSoftware && matchVersion && matchFabricante;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroEquipo = '';
    this.filtroSoftware = '';
    this.filtroVersion = '';
    this.filtroFabricante = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class SoftwareComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.softwareList
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.softwareList\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.softwareList\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SoftwareComponent updated.');
