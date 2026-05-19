const fs = require('fs');

let content = fs.readFileSync('src/src/app/components/sitios/sitios.component.ts', 'utf8');

// Replace select template for ambiente
content = content.replace(
  /@for\(amb of ambientesOpciones; track amb\) \{\s*<option \[value\]="amb">\{\{amb\}\}<\/option>\s*\}/,
  `@for(amb of ambientesOpciones; track amb.id) {
                <option [value]="amb.nombre">{{amb.nombre}}</option>
              }`
);

// Add select template for sitio
content = content.replace(
  /<input formControlName="sitio" placeholder="Sitio \(ej\. Avatar, Intranet\)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">/,
  `<select formControlName="sitio" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
              <option value="">Seleccione Sitio</option>
              @for(sitio of sitiosOpciones; track sitio.id) {
                <option [value]="sitio.nombre">{{sitio.nombre}}</option>
              }
            </select>`
);

// Add sitiosOpciones property
content = content.replace(
  /ambientesOpciones: Catalogo\[\] = \[\];/,
  `ambientesOpciones: Catalogo[] = [];
  sitiosOpciones: Catalogo[] = [];`
);

// Load catalogs
content = content.replace(
  /this.api.getPuestos\(\).subscribe\(res => this.puestos = res\);/,
  `this.api.getPuestos().subscribe(res => this.puestos = res);
    this.api.getAmbientes().subscribe(res => this.ambientesOpciones = res);
    this.api.getSitiosCat().subscribe(res => this.sitiosOpciones = res);`
);

fs.writeFileSync('src/src/app/components/sitios/sitios.component.ts', content);
