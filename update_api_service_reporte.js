const fs = require('fs');
let content = fs.readFileSync('src/src/app/services/api.service.ts', 'utf8');

content = content.replace(
    /import \{ Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo \} from '\.\.\/models\/models';/,
    `import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo, ReportePerfil } from '../models/models';`
);

const newMethods = `
  // --- Reportes ---
  getReportePerfil(codigo: string): Observable<ReportePerfil[]> {
    return this.http.get<ReportePerfil[]>(\`\${this.apiUrl}/Reportes/perfil/\${codigo}\`, { headers: this.getHeaders() });
  }
}
`;

content = content.replace(/\}\n?$/, newMethods);
fs.writeFileSync('src/src/app/services/api.service.ts', content);
