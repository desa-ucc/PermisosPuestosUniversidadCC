const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

// Fix API Service usage
code = code.replace(/getAccesoBDs\(\)/g, 'getAccesosBD()');
code = code.replace(/getAccesoBDsNombres\(\)/g, 'getAccesosBD()'); // Not needed actually since we replace getCatalogos completely below.


// Clean unused properties
code = code.replace(/filtroLicencia = '';/g, '');
code = code.replace(/filtroAccesoBD = '';/g, '');
code = code.replace(/filtroModulos = '';/g, '');
code = code.replace(/filtroAccesos = '';/g, '');
code = code.replace(/filtroNivel = '';/g, '');


// Fix edit method
code = code.replace(/edit\(acbd: AccesoBD\) {[\s\S]*?searchTermNiveles = acbd\.nivelAcceso \|\| '';\n  }/, `edit(acbd: AccesoBD) {
    if (!this.permissionService.tienePermiso('ADMINBASEDATOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = acbd.id;
    this.accesoBDForm.enable();
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones
    });
    this.onEmpleadoChange(null);
    if (acbd.empleadoId) {
        const matched = this.empleados.find(e => e.id === acbd.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }`);

// Fix verDetalle method
code = code.replace(/verDetalle\(acbd: AccesoBD\) {[\s\S]*?searchTermNiveles = acbd\.nivelAcceso \|\| '';\n  }/, `verDetalle(acbd: AccesoBD) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = acbd.id;
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones
    });
    this.onEmpleadoChange(null);
    this.accesoBDForm.disable();
    if (acbd.empleadoId) {
        const matched = this.empleados.find(e => e.id === acbd.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }`);

// Fix loadCatalogos method to only load nivelesAcceso
code = code.replace(/loadCatalogos\(\) {[\s\S]*?}/, `loadCatalogos() {
    this.api.getNivelesAcceso().subscribe(res => this.nivelesAcceso = res);
  }`);


// Find the duplicate block of code with getAccesoBDNombres, tiposLicencia and remove it
const catalogosMatch = code.match(/servidores: Catalogo\[\] = \[\];\n  tiposLicencia: Catalogo\[\] = \[\];/);
if (catalogosMatch) {
    code = code.replace(/servidores: Catalogo\[\] = \[\];\n  tiposLicencia: Catalogo\[\] = \[\];/, '');
}

code = code.replace(/this\.api\.getAccesoBDNombres\(\)\.subscribe\(res => this\.servidores = res\);/g, '');
code = code.replace(/this\.api\.getTiposLicencia\(\)\.subscribe\(res => this\.tiposLicencia = res\);/g, '');

fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Applied further fixes.");
