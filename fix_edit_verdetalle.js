const fs = require('fs');

const hardwareIdealPath = './src/src/app/components/hardware-ideal/hardware-ideal.component.ts';
let hwIdealContent = fs.readFileSync(hardwareIdealPath, 'utf8');
hwIdealContent = hwIdealContent.replace(
/  edit\(hw: HardwareIdeal\) \{\s*this\.isEditing = true;\s*this\.isReadOnly = false;\s*this\.currentId = hw\.id;\s*this\.hwIdealForm\.enable\(\);\s*this\.hwIdealForm\.patchValue\(hw\);\s*\}/,
`  edit(hw: HardwareIdeal) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = hw.id;
    this.hwIdealForm.enable();
    this.hwIdealForm.patchValue(hw);
    if (hw.puestoId) {
        const matched = this.puestos.find(p => p.id === hw.puestoId);
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
  }`
);
hwIdealContent = hwIdealContent.replace(
/  verDetalle\(hw: HardwareIdeal\) \{\s*this\.isReadOnly = true;\s*this\.isEditing = false;\s*this\.currentId = hw\.id;\s*this\.hwIdealForm\.patchValue\(hw\);\s*this\.hwIdealForm\.disable\(\);\s*\}/,
`  verDetalle(hw: HardwareIdeal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwIdealForm.patchValue(hw);
    this.hwIdealForm.disable();
    if (hw.puestoId) {
        const matched = this.puestos.find(p => p.id === hw.puestoId);
        if (matched) this.searchTermPuestos = matched.nombrePuesto;
    } else {
        this.searchTermPuestos = '';
    }
  }`
);
fs.writeFileSync(hardwareIdealPath, hwIdealContent, 'utf8');

const hardwarePath = './src/src/app/components/hardware/hardware.component.ts';
let hwContent = fs.readFileSync(hardwarePath, 'utf8');
hwContent = hwContent.replace(
/  verDetalle\(hw: HardwareAsignado\) \{\s*this\.isReadOnly = true;\s*this\.isEditing = false;\s*this\.currentId = hw\.id;\s*this\.hwForm\.patchValue\(hw\);\s*this\.onEmpleadoChange\(null\);\s*this\.hwForm\.disable\(\);\s*\}/,
`  verDetalle(hw: HardwareAsignado) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = hw.id;
    this.hwForm.patchValue(hw);
    this.onEmpleadoChange(null);
    this.hwForm.disable();
    if (hw.empleadoId) {
        const matched = this.empleados.find(e => e.id === hw.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
  }`
);
fs.writeFileSync(hardwarePath, hwContent, 'utf8');

const softwarePath = './src/src/app/components/software/software.component.ts';
let swContent = fs.readFileSync(softwarePath, 'utf8');
swContent = swContent.replace(
/  verDetalle\(sw: SoftwareLocal\) \{\s*this\.isReadOnly = true;\s*this\.isEditing = false;\s*this\.currentId = sw\.id;\s*this\.swForm\.patchValue\(sw\);\s*this\.swForm\.disable\(\);\s*\}/,
`  verDetalle(sw: SoftwareLocal) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sw.id;
    this.swForm.patchValue(sw);
    this.swForm.disable();
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = \`\${matched.placa} - \${matched.marcaPC}\`;
    } else {
        this.searchTermEquipos = '';
    }
  }`
);
fs.writeFileSync(softwarePath, swContent, 'utf8');

const sitiosPath = './src/src/app/components/sitios/sitios.component.ts';
let sitiosContent = fs.readFileSync(sitiosPath, 'utf8');
sitiosContent = sitiosContent.replace(
/  edit\(sitio: PermisosSitio\) \{[\s\S]*?this\.onEmpleadoChange\(null\); \/\/ Update UI\s*\}/,
`  edit(sitio: PermisosSitio) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sitio.id;
    this.sitioForm.enable();
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null);
    if (sitio.empleadoId) {
        const matched = this.empleados.find(e => e.id === sitio.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermSitios = sitio.sitio || '';
    this.searchTermAmbientes = sitio.ambiente || '';
  }`
);
sitiosContent = sitiosContent.replace(
/  verDetalle\(sitio: PermisosSitio\) \{[\s\S]*?this\.sitioForm\.disable\(\);\s*\}/,
`  verDetalle(sitio: PermisosSitio) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = sitio.id;
    this.sitioForm.patchValue({
      empleadoId: sitio.empleadoId,
      sitio: sitio.sitio,
      ambiente: sitio.ambiente,
      gruposPermisos: sitio.gruposPermisos
    });
    this.onEmpleadoChange(null);
    this.sitioForm.disable();
    if (sitio.empleadoId) {
        const matched = this.empleados.find(e => e.id === sitio.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermSitios = sitio.sitio || '';
    this.searchTermAmbientes = sitio.ambiente || '';
  }`
);
fs.writeFileSync(sitiosPath, sitiosContent, 'utf8');

const plataformasPath = './src/src/app/components/plataformas/plataformas.component.ts';
let platContent = fs.readFileSync(plataformasPath, 'utf8');
platContent = platContent.replace(
/  edit\(plat: Plataforma\) \{[\s\S]*?this\.onEmpleadoChange\(null\);\s*\}/,
`  edit(plat: Plataforma) {
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = plat.id;
    this.plataformaForm.enable();
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso
    });
    this.onEmpleadoChange(null);
    if (plat.empleadoId) {
        const matched = this.empleados.find(e => e.id === plat.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }`
);
platContent = platContent.replace(
/  verDetalle\(plat: Plataforma\) \{[\s\S]*?this\.plataformaForm\.disable\(\);\s*\}/,
`  verDetalle(plat: Plataforma) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = plat.id;
    this.plataformaForm.patchValue({
      empleadoId: plat.empleadoId,
      licencias: plat.licencias,
      nombrePlataforma: plat.nombrePlataforma,
      modulos: plat.modulos,
      accesosPermisos: plat.accesosPermisos,
      nivelAcceso: plat.nivelAcceso
    });
    this.onEmpleadoChange(null);
    this.plataformaForm.disable();
    if (plat.empleadoId) {
        const matched = this.empleados.find(e => e.id === plat.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermLicencias = plat.licencias || '';
    this.searchTermPlataformas = plat.nombrePlataforma || '';
    this.searchTermNiveles = plat.nivelAcceso || '';
  }`
);
fs.writeFileSync(plataformasPath, platContent, 'utf8');

console.log('Fixes applied.');
