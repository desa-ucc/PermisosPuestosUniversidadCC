const fs = require('fs');

const path = './src/src/app/components/plataformas/plataformas.component.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert HTML filter row
const theadEnd = /<\/thead>/;
const filterRow = `
          <tr class="bg-ucc-surface border-b border-ucc-neutral-outline/20">
            <td class="p-2"><input type="text" [(ngModel)]="filtroPersona" placeholder="Filtrar Persona..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPuesto" placeholder="Filtrar Puesto..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroLicencia" placeholder="Filtrar Licencia..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroPlataforma" placeholder="Filtrar Plataforma..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroModulos" placeholder="Filtrar Módulos..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroAccesos" placeholder="Filtrar Accesos..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2"><input type="text" [(ngModel)]="filtroNivel" placeholder="Filtrar Nivel..." class="w-full text-sm py-1 px-2 border border-ucc-neutral-outline rounded-lg focus:ring-1 focus:ring-ucc-primary"></td>
            <td class="p-2 text-center">
              <button (click)="limpiarFiltrosTabla()" class="text-xs text-ucc-primary hover:underline">Limpiar</button>
            </td>
          </tr>
`;
content = content.replace(theadEnd, filterRow + '          </thead>');

// Insert TS Logic
const classStart = /export class PlataformasComponent implements OnInit \{/;
const tsLogic = `
  // Filtros de Tabla
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroLicencia: string = '';
  filtroPlataforma: string = '';
  filtroModulos: string = '';
  filtroAccesos: string = '';
  filtroNivel: string = '';

  get listaFiltradaTabla() {
    return this.plataformas.filter(plat => {
      const personaNombre = this.getEmpleadoName(plat.empleadoId);
      const puestoNombre = this.getPuestoByEmpleado(plat.empleadoId);

      const matchPersona = personaNombre.toLowerCase().includes(this.filtroPersona.toLowerCase());
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchLicencia = plat.licencias?.toLowerCase().includes(this.filtroLicencia.toLowerCase()) ?? true;
      const matchPlataforma = plat.nombrePlataforma?.toLowerCase().includes(this.filtroPlataforma.toLowerCase()) ?? true;
      const matchModulos = plat.modulos?.toLowerCase().includes(this.filtroModulos.toLowerCase()) ?? true;
      const matchAccesos = plat.accesosPermisos?.toLowerCase().includes(this.filtroAccesos.toLowerCase()) ?? true;
      const matchNivel = plat.nivelAcceso?.toLowerCase().includes(this.filtroNivel.toLowerCase()) ?? true;

      return matchPersona && matchPuesto && matchLicencia && matchPlataforma && matchModulos && matchAccesos && matchNivel;
    });
  }

  limpiarFiltrosTabla() {
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroLicencia = '';
    this.filtroPlataforma = '';
    this.filtroModulos = '';
    this.filtroAccesos = '';
    this.filtroNivel = '';
    this.currentPage = 1;
  }
`;
content = content.replace(classStart, 'export class PlataformasComponent implements OnInit {\n' + tsLogic);

// Update paginatedList and totalPages to use the filtered getter instead of this.plataformas
content = content.replace(
/  get paginatedList\(\) \{\s*const start = \(this\.currentPage - 1\) \* this\.pageSize;\s*return this\.plataformas\.slice\(start, start \+ this\.pageSize\);\s*\}/,
`  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }`
);
content = content.replace(
/  get totalPages\(\) \{\s*return Math\.ceil\(this\.plataformas\.length \/ this\.pageSize\) \|\| 1;\s*\}/,
`  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }`
);

fs.writeFileSync(path, content, 'utf8');
console.log('PlataformasComponent updated.');
