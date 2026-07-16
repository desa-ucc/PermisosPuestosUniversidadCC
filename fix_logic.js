const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

code = code.replace(/filtros = {[\s\S]*?};/, `filtros = {
    codigoPuesto: '',
    nombreCompleto: '',
    nombrePuesto: '',
    servidor: '',
    baseDatos: '',
    nivelAcceso: '',
    observaciones: ''
  };`);

code = code.replace(/aplicarFiltros\(\) {[\s\S]*?}/, `aplicarFiltros() {
    this.listaFiltradaTabla = this.accesosBD.filter(acbd => {
      const matchCodigoPuesto = !this.filtros.codigoPuesto || (acbd.codigoPuesto && acbd.codigoPuesto.toLowerCase().includes(this.filtros.codigoPuesto.toLowerCase()));
      const matchNombreCompleto = !this.filtros.nombreCompleto || (acbd.nombreCompleto && acbd.nombreCompleto.toLowerCase().includes(this.filtros.nombreCompleto.toLowerCase()));
      const matchNombrePuesto = !this.filtros.nombrePuesto || (acbd.nombrePuesto && acbd.nombrePuesto.toLowerCase().includes(this.filtros.nombrePuesto.toLowerCase()));
      const matchServidor = !this.filtros.servidor || (acbd.servidor && acbd.servidor.toLowerCase().includes(this.filtros.servidor.toLowerCase()));
      const matchBaseDatos = !this.filtros.baseDatos || (acbd.baseDatos && acbd.baseDatos.toLowerCase().includes(this.filtros.baseDatos.toLowerCase()));
      const matchNivelAcceso = !this.filtros.nivelAcceso || (acbd.nivelAcceso && acbd.nivelAcceso.toLowerCase().includes(this.filtros.nivelAcceso.toLowerCase()));
      const matchObservaciones = !this.filtros.observaciones || (acbd.observaciones && acbd.observaciones.toLowerCase().includes(this.filtros.observaciones.toLowerCase()));

      return matchCodigoPuesto && matchNombreCompleto && matchNombrePuesto && matchServidor && matchBaseDatos && matchNivelAcceso && matchObservaciones;
    });
    this.currentPage = 1;
  }`);

code = code.replace(/Math = Math;/g, 'Math = Math;');
if (!code.includes('Math = Math;')) {
    code = code.replace('export class BaseDatosComponent implements OnInit {', 'export class BaseDatosComponent implements OnInit {\n  Math = Math;');
}

fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Updated logic in component");
