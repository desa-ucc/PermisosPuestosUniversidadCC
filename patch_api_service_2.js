const fs = require('fs');
let code = fs.readFileSync('src/src/app/services/api.service.ts', 'utf8');

if (!code.includes('getAccesosBD')) {
    const searchStr = `  getPlataformas(): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(\`\${this.apiUrl}/Plataformas\`);
  }`;

    const replaceStr = searchStr + `

  getAccesosBD(): Observable<AccesoBD[]> {
    return this.http.get<AccesoBD[]>(\`\${this.apiUrl}/AccesosBD\`);
  }

  createAccesoBD(data: AccesoBD): Observable<any> {
    return this.http.post(\`\${this.apiUrl}/AccesosBD\`, data);
  }

  updateAccesoBD(id: number, data: AccesoBD): Observable<any> {
    return this.http.put(\`\${this.apiUrl}/AccesosBD/\${id}\`, data);
  }

  deleteAccesoBD(id: number): Observable<any> {
    return this.http.delete(\`\${this.apiUrl}/AccesosBD/\${id}\`);
  }`;
    code = code.replace(searchStr, replaceStr);

    // add AccesoBD import if missing
    if(!code.includes('AccesoBD')) {
         code = code.replace(
        'import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisoSitio, Plataforma, Catalogo, CatalogoTipoHardware, Usuario, Permiso, ReportePerfil, ReporteHardware, ReporteSitio, ReportePlataforma, Rol } from \'../models/models\';',
        'import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisoSitio, Plataforma, Catalogo, CatalogoTipoHardware, Usuario, Permiso, ReportePerfil, ReporteHardware, ReporteSitio, ReportePlataforma, Rol, AccesoBD } from \'../models/models\';'
        );
    }
    fs.writeFileSync('src/src/app/services/api.service.ts', code);
    console.log("Updated api.service.ts");
}
