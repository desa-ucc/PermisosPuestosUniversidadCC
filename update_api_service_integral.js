const fs = require('fs');

let content = fs.readFileSync('src/src/app/services/api.service.ts', 'utf8');

content = content.replace(
  /import \{ (.*)ReportePerfil \} from '\.\.\/models\/models';/,
  `import { $1ReportePerfil, ReporteIntegralResponse } from '../models/models';`
);

content = content.replace(
  /\}\n?$/,
  `  getReporteIntegral(termino: string): Observable<ReporteIntegralResponse> {
    return this.http.get<ReporteIntegralResponse>(\`\${this.apiUrl}/Reportes/integral/\${termino}\`, { headers: this.getHeaders() });
  }
}
`
);

fs.writeFileSync('src/src/app/services/api.service.ts', content);
