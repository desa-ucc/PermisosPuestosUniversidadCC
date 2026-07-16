const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

// Replace loadCatalogos with a method that just initializes static levels, since the catalog endpoint is missing
// The existing Plataformas components probably had these static/dynamic, let's just make it static or remove it.
// Looking at the prompt, Nivel is just a text field, but in Plataformas it was a dropdown.

code = code.replace(/loadCatalogos\(\) {[\s\S]*?}/, `loadCatalogos() {
    this.nivelesAcceso = [
        { id: 1, nombre: 'Lectura', valor: 'Lectura', activo: true },
        { id: 2, nombre: 'Escritura', valor: 'Escritura', activo: true },
        { id: 3, nombre: 'Admin', valor: 'Admin', activo: true },
        { id: 4, nombre: 'Dueño', valor: 'Dueño', activo: true }
    ];
  }`);

fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Fixed loadCatalogos in base-datos");
