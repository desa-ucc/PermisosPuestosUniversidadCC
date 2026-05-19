const fs = require('fs');
let content = fs.readFileSync('src/src/app/services/api.service.ts', 'utf8');

const newMethods = `
  getNivelesAcceso(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(\`\${this.apiUrl}/Catalogos/NivelesAcceso\`, { headers: this.getHeaders() }); }
  getPlataformasNombres(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(\`\${this.apiUrl}/Catalogos/PlataformasNombres\`, { headers: this.getHeaders() }); }
  getTiposLicencia(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(\`\${this.apiUrl}/Catalogos/TiposLicencia\`, { headers: this.getHeaders() }); }
}
`;

content = content.replace(/\}\n?$/, newMethods);
fs.writeFileSync('src/src/app/services/api.service.ts', content);
