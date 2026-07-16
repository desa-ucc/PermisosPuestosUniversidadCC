const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

code = code.replace(/loadCatalogos\(\) {[\s\S]*?}/, `loadCatalogos() {
    this.api.getNivelesAcceso().subscribe(res => this.nivelesAcceso = res);
  }`);

fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Fixed loadCatalogos back");
