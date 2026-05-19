const fs = require('fs');

let content = fs.readFileSync('src/src/app/components/plataformas/plataformas.component.ts', 'utf8');

// Replace import
content = content.replace(
  /import { Plataforma, Empleado, Puesto } from '\.\.\/\.\.\/models\/models';/,
  `import { Plataforma, Empleado, Puesto, Catalogo } from '../../models/models';`
);

// Replace select template for plataforma
content = content.replace(
  /<input formControlName="nombrePlataforma" placeholder="Plataforma \(ej\. Moodle, O365\)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">/,
  `<select formControlName="nombrePlataforma" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option value="">Seleccione Plataforma</option>
              @for(plat of plataformasOpciones; track plat.id) {
                <option [value]="plat.nombre">{{plat.nombre}}</option>
              }
            </select>`
);

// Add plataformasOpciones property
content = content.replace(
  /licenciasOpciones: string\[\] = \['Posee', 'No tiene'\];/,
  `licenciasOpciones: string[] = ['Posee', 'No tiene'];
  plataformasOpciones: Catalogo[] = [];`
);

// Load catalogs
content = content.replace(
  /this.api.getPuestos\(\).subscribe\(res => this.puestos = res\);/,
  `this.api.getPuestos().subscribe(res => this.puestos = res);
    this.api.getPlataformasCat().subscribe(res => this.plataformasOpciones = res);`
);

fs.writeFileSync('src/src/app/components/plataformas/plataformas.component.ts', content);
