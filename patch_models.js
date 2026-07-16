const fs = require('fs');
let code = fs.readFileSync('src/src/app/models/models.ts', 'utf8');

if (!code.includes('export interface AccesoBD')) {
    code += `
export interface AccesoBD {
  id: number;
  empleadoId: number;
  nombreCompleto?: string;
  codigoPuesto?: string;
  nombrePuesto?: string;
  servidor: string;
  baseDatos: string;
  nivelAcceso: string;
  observaciones?: string;
}
`;
    fs.writeFileSync('src/src/app/models/models.ts', code);
    console.log("Updated models.ts");
}
