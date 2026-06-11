const fs = require('fs');

const path = './src/src/app/components/sitios/sitios.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroPersona" placeholder="Filtrar Persona..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuesto" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroSitio" placeholder="Filtrar Sitio..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroAmbiente" placeholder="Filtrar Ambiente..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroGrupos" placeholder="Filtrar Grupos..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar Filtros</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class SitiosComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroSitio: string = '';
  filtroAmbiente: string = '';
  filtroGrupos: string = '';

  get listaFiltradaTabla() {
    return this.permisosSitios.filter(sitio => {
      const personaNombre = this.getEmpleadoName(sitio.empleadoId);
      const puestoNombre = this.getPuestoByEmpleado(sitio.empleadoId);

      const matchPersona = personaNombre.toLowerCase().includes(this.filtroPersona.toLowerCase());
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchSitio = sitio.sitio?.toLowerCase().includes(this.filtroSitio.toLowerCase()) ?? true;
      const matchAmbiente = sitio.ambiente?.toLowerCase().includes(this.filtroAmbiente.toLowerCase()) ?? true;
      const matchGrupos = sitio.gruposPermisos?.toLowerCase().includes(this.filtroGrupos.toLowerCase()) ?? true;

      return matchPersona && matchPuesto && matchSitio && matchAmbiente && matchGrupos;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroSitio = '';
    this.filtroAmbiente = '';
    this.filtroGrupos = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class SitiosComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.permisosSitios
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.permisosSitios\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.permisosSitios\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SitiosComponent updated.');
