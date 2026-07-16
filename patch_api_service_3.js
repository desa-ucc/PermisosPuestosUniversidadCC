const fs = require('fs');
let code = fs.readFileSync('src/src/app/services/api.service.ts', 'utf8');

if (!code.includes('getAccesosBD')) {
    const searchStr = `  // --- Plataformas ---
  getPlataformas(): Observable<Plataforma[]> { return this.http.get<Plataforma[]>(\`\${this.apiUrl}/Plataformas\`, { headers: this.getHeaders() }); }
  createPlataforma(data: Partial<Plataforma>): Observable<Plataforma> { return this.http.post<Plataforma>(\`\${this.apiUrl}/Plataformas\`, data, { headers: this.getHeaders() }); }
  updatePlataforma(id: number, data: Partial<Plataforma>): Observable<any> { return this.http.put(\`\${this.apiUrl}/Plataformas/\${id}\`, data, { headers: this.getHeaders() }); }
  deletePlataforma(id: number): Observable<any> { return this.http.delete(\`\${this.apiUrl}/Plataformas/\${id}\`, { headers: this.getHeaders() }); }`;

    const replaceStr = searchStr + `

  // --- Base de Datos ---
  getAccesosBD(): Observable<AccesoBD[]> { return this.http.get<AccesoBD[]>(\`\${this.apiUrl}/AccesosBD\`, { headers: this.getHeaders() }); }
  createAccesoBD(data: Partial<AccesoBD>): Observable<AccesoBD> { return this.http.post<AccesoBD>(\`\${this.apiUrl}/AccesosBD\`, data, { headers: this.getHeaders() }); }
  updateAccesoBD(id: number, data: Partial<AccesoBD>): Observable<any> { return this.http.put(\`\${this.apiUrl}/AccesosBD/\${id}\`, data, { headers: this.getHeaders() }); }
  deleteAccesoBD(id: number): Observable<any> { return this.http.delete(\`\${this.apiUrl}/AccesosBD/\${id}\`, { headers: this.getHeaders() }); }`;

    code = code.replace(searchStr, replaceStr);

    if(!code.includes('AccesoBD')) {
        code = code.replace(
        'import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo, ReportePerfil, ReporteIntegralResponse } from \'../models/models\';',
        'import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo, ReportePerfil, ReporteIntegralResponse, AccesoBD } from \'../models/models\';'
        );
    }
    fs.writeFileSync('src/src/app/services/api.service.ts', code);
    console.log("Updated api.service.ts");
}
