const fs = require('fs');

const createToolbar = (inputs) => `
            <!-- TOOLBAR DE FILTROS MAESTRA -->
            <div class="bg-white border-b border-ucc-neutral-outline/20 p-4 flex flex-wrap gap-3 items-center">
              <span class="material-symbols-rounded text-ucc-primary">filter_list</span>
              ${inputs.map(i => `<input type="text" placeholder="Filtrar ${i.label}..." [(ngModel)]="${i.model}" (input)="aplicarFiltros()" class="bg-ucc-surface-container-low border border-ucc-neutral-outline/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-ucc-primary outline-none transition-all w-48">`).join('\n              ')}
              <button (click)="limpiarFiltros()" class="ml-auto flex items-center gap-2 text-ucc-primary hover:bg-ucc-primary/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold">
                <span class="material-symbols-rounded text-lg">refresh</span> Limpiar
              </button>
            </div>
`;

function replaceToolbar(filePath, inputs, classMatch, tsLogic) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match existing toolbars. We'll look for `<div class="bg-white border-b border-ucc-neutral-outline/20 p-4` up to `</div>`
  // that precedes the table. Let's use a simpler regex.
  const toolbarRegex = /<!-- TOOLBAR DE FILTROS[\s\S]*?<\/div>\s*<table class="ucc-table">/g;

  if(toolbarRegex.test(content)) {
      content = content.replace(toolbarRegex, createToolbar(inputs) + '        <table class="ucc-table">');
  } else {
    // If not found with table, try just the toolbar.
    const fallbackRegex = /<!-- TOOLBAR DE FILTROS[\s\S]*?<\/div>/g;
    content = content.replace(fallbackRegex, createToolbar(inputs).trim());
  }

  // Handle TS changes (rename limpiarFiltrosTabla to limpiarFiltros, and ensure aplicarFiltros exists).
  content = content.replace(/limpiarFiltrosTabla\(\)/g, 'limpiarFiltros()');

  const oldLogicRegex = /\/\/ Filtros de Tabla[\s\S]*?limpiarFiltros[a-zA-Z0-9_]*\(\) \{[\s\S]*?this\.currentPage = 1;\s*\}/;
  content = content.replace(oldLogicRegex, tsLogic.trim());

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

// 1. Puestos
replaceToolbar('./src/src/app/components/puestos/puestos.component.ts', [
  { label: 'Código', model: 'filtroCodigo' },
  { label: 'Nombre', model: 'filtroNombre' },
  { label: 'Descripción', model: 'filtroDescripcion' }
], 'PuestosComponent', `
  // Filtros de Tabla
  filtroCodigo: string = '';
  filtroNombre: string = '';
  filtroDescripcion: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.puestos.filter(puesto => {
      const matchCodigo = puesto.codigoPuesto?.toLowerCase().includes(this.filtroCodigo.toLowerCase()) ?? true;
      const matchNombre = puesto.nombrePuesto?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ?? true;
      const matchDescripcion = puesto.descripcion?.toLowerCase().includes(this.filtroDescripcion.toLowerCase()) ?? true;

      return matchCodigo && matchNombre && matchDescripcion;
    });
  }

  limpiarFiltros() {
    this.filtroCodigo = '';
    this.filtroNombre = '';
    this.filtroDescripcion = '';
    this.aplicarFiltros();
  }
`);

// 2. Colaboradores
replaceToolbar('./src/src/app/components/colaboradores/colaboradores.component.ts', [
  { label: 'Código', model: 'filtroCodigo' },
  { label: 'Nombre', model: 'filtroNombre' },
  { label: 'Correo', model: 'filtroCorreo' },
  { label: 'Puesto', model: 'filtroPuestoTabla' }
], 'ColaboradoresComponent', `
  // Filtros de Tabla
  filtroCodigo: string = '';
  filtroNombre: string = '';
  filtroCorreo: string = '';
  filtroPuestoTabla: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get empleadosFiltradosTabla() {
    return this.empleados.filter(emp => {
      const matchCodigo = emp.codigoEmpleado?.toLowerCase().includes(this.filtroCodigo.toLowerCase()) ?? true;
      const matchNombre = emp.nombreCompleto?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ?? true;
      const matchCorreo = emp.correoInstitucional?.toLowerCase().includes(this.filtroCorreo.toLowerCase()) ?? true;
      const matchPuesto = (emp.nombrePuesto || 'No Asignado').toLowerCase().includes(this.filtroPuestoTabla.toLowerCase());

      return matchCodigo && matchNombre && matchCorreo && matchPuesto;
    });
  }

  limpiarFiltros() {
    this.filtroCodigo = '';
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroPuestoTabla = '';
    this.aplicarFiltros();
  }
`);

// 3. Hardware Ideal
replaceToolbar('./src/src/app/components/hardware-ideal/hardware-ideal.component.ts', [
  { label: 'Puesto', model: 'filtroPuestoRel' },
  { label: 'Equipo', model: 'filtroEquipo' },
  { label: 'Procesador', model: 'filtroProcesador' },
  { label: 'Memoria', model: 'filtroMemoria' }
], 'HardwareIdealComponent', `
  // Filtros de Tabla
  filtroPuestoRel: string = '';
  filtroEquipo: string = '';
  filtroProcesador: string = '';
  filtroMemoria: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.equiposIdeales.filter(hw => {
      const puestoNombre = this.getPuestoName(hw.puestoId);
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuestoRel.toLowerCase());
      const matchEquipo = hw.tipoEquipo?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ?? true;
      const matchProcesador = hw.procesador?.toLowerCase().includes(this.filtroProcesador.toLowerCase()) ?? true;
      const matchMemoria = hw.memoria?.toLowerCase().includes(this.filtroMemoria.toLowerCase()) ?? true;

      return matchPuesto && matchEquipo && matchProcesador && matchMemoria;
    });
  }

  limpiarFiltros() {
    this.filtroPuestoRel = '';
    this.filtroEquipo = '';
    this.filtroProcesador = '';
    this.filtroMemoria = '';
    this.aplicarFiltros();
  }
`);

// 4. Hardware
replaceToolbar('./src/src/app/components/hardware/hardware.component.ts', [
  { label: 'Puesto', model: 'filtroPuesto' },
  { label: 'Persona', model: 'filtroEmpleado' },
  { label: 'Equipo', model: 'filtroEquipo' },
  { label: 'Marca', model: 'filtroMarca' },
  { label: 'Placa', model: 'filtroPlaca' }
], 'HardwareComponent', `
  // Filtros de Tabla
  filtroPuesto: string = '';
  filtroEmpleado: string = '';
  filtroEquipo: string = '';
  filtroMarca: string = '';
  filtroPlaca: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.equipos.filter(hw => {
      const puestoNombre = this.getPuestoByEmpleado(hw.empleadoId);
      const empleadoNombre = this.getEmpleadoName(hw.empleadoId);

      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchEmpleado = empleadoNombre.toLowerCase().includes(this.filtroEmpleado.toLowerCase());
      const matchEquipo = hw.tipoEquipo?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ?? true;
      const matchMarca = hw.marcaPC?.toLowerCase().includes(this.filtroMarca.toLowerCase()) ?? true;
      const matchPlaca = hw.placa?.toLowerCase().includes(this.filtroPlaca.toLowerCase()) ?? true;

      return matchPuesto && matchEmpleado && matchEquipo && matchMarca && matchPlaca;
    });
  }

  limpiarFiltros() {
    this.filtroPuesto = '';
    this.filtroEmpleado = '';
    this.filtroEquipo = '';
    this.filtroMarca = '';
    this.filtroPlaca = '';
    this.aplicarFiltros();
  }
`);

// 5. Software
replaceToolbar('./src/src/app/components/software/software.component.ts', [
  { label: 'Equipo', model: 'filtroEquipo' },
  { label: 'Software', model: 'filtroSoftware' },
  { label: 'Versión', model: 'filtroVersion' },
  { label: 'Fabricante', model: 'filtroFabricante' }
], 'SoftwareComponent', `
  // Filtros de Tabla
  filtroEquipo: string = '';
  filtroSoftware: string = '';
  filtroVersion: string = '';
  filtroFabricante: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.softwareList.filter(sw => {
      const equipoNombre = this.getEquipoPlaca(sw.empleadoId);

      const matchEquipo = equipoNombre.toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const matchSoftware = sw.nombreSoftware?.toLowerCase().includes(this.filtroSoftware.toLowerCase()) ?? true;
      const matchVersion = sw.version?.toLowerCase().includes(this.filtroVersion.toLowerCase()) ?? true;
      const matchFabricante = sw.fabricante?.toLowerCase().includes(this.filtroFabricante.toLowerCase()) ?? true;

      return matchEquipo && matchSoftware && matchVersion && matchFabricante;
    });
  }

  limpiarFiltros() {
    this.filtroEquipo = '';
    this.filtroSoftware = '';
    this.filtroVersion = '';
    this.filtroFabricante = '';
    this.aplicarFiltros();
  }
`);

// 6. Sitios
replaceToolbar('./src/src/app/components/sitios/sitios.component.ts', [
  { label: 'Persona', model: 'filtroPersona' },
  { label: 'Puesto', model: 'filtroPuesto' },
  { label: 'Sitio', model: 'filtroSitio' },
  { label: 'Ambiente', model: 'filtroAmbiente' },
  { label: 'Grupos', model: 'filtroGrupos' }
], 'SitiosComponent', `
  // Filtros de Tabla
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroSitio: string = '';
  filtroAmbiente: string = '';
  filtroGrupos: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.permisosSitios.filter(sitio => {
      const personaNombre = this.getEmpleadoName(sitio.empleadoId);
      const puestoNombre = this.getPuestoByEmpleado(sitio.empleadoId);

      const matchPersona = personaNombre.toLowerCase().includes(this.filtroPersona.toLowerCase());
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchSitio = sitio.sitio?.toLowerCase().includes(this.filtroSitio.toLowerCase()) ?? true;
      const matchAmbiente = sitio.ambiente?.toLowerCase().includes(this.filtroAmbiente.toLowerCase()) ?? true;
      const matchGrupos = sitio.gruposPermisos?.toLowerCase().includes(this.filtroGrupos.toLowerCase()) ?? true;

      return matchPersona && matchPuesto && matchSitio && matchAmbiente && matchGrupos;
    });
  }

  limpiarFiltros() {
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroSitio = '';
    this.filtroAmbiente = '';
    this.filtroGrupos = '';
    this.aplicarFiltros();
  }
`);

// 7. Plataformas
replaceToolbar('./src/src/app/components/plataformas/plataformas.component.ts', [
  { label: 'Persona', model: 'filtroPersona' },
  { label: 'Puesto', model: 'filtroPuesto' },
  { label: 'Licencia', model: 'filtroLicencia' },
  { label: 'Plataforma', model: 'filtroPlataforma' },
  { label: 'Módulos', model: 'filtroModulos' },
  { label: 'Accesos', model: 'filtroAccesos' },
  { label: 'Nivel', model: 'filtroNivel' }
], 'PlataformasComponent', `
  // Filtros de Tabla
  filtroPersona: string = '';
  filtroPuesto: string = '';
  filtroLicencia: string = '';
  filtroPlataforma: string = '';
  filtroModulos: string = '';
  filtroAccesos: string = '';
  filtroNivel: string = '';

  aplicarFiltros() {
    this.currentPage = 1;
  }

  get listaFiltradaTabla() {
    return this.plataformas.filter(plat => {
      const personaNombre = this.getEmpleadoName(plat.empleadoId);
      const puestoNombre = this.getPuestoByEmpleado(plat.empleadoId);

      const matchPersona = personaNombre.toLowerCase().includes(this.filtroPersona.toLowerCase());
      const matchPuesto = puestoNombre.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchLicencia = plat.licencias?.toLowerCase().includes(this.filtroLicencia.toLowerCase()) ?? true;
      const matchPlataforma = plat.nombrePlataforma?.toLowerCase().includes(this.filtroPlataforma.toLowerCase()) ?? true;
      const matchModulos = plat.modulos?.toLowerCase().includes(this.filtroModulos.toLowerCase()) ?? true;
      const matchAccesos = plat.accesosPermisos?.toLowerCase().includes(this.filtroAccesos.toLowerCase()) ?? true;
      const matchNivel = plat.nivelAcceso?.toLowerCase().includes(this.filtroNivel.toLowerCase()) ?? true;

      return matchPersona && matchPuesto && matchLicencia && matchPlataforma && matchModulos && matchAccesos && matchNivel;
    });
  }

  limpiarFiltros() {
    this.filtroPersona = '';
    this.filtroPuesto = '';
    this.filtroLicencia = '';
    this.filtroPlataforma = '';
    this.filtroModulos = '';
    this.filtroAccesos = '';
    this.filtroNivel = '';
    this.aplicarFiltros();
  }
`);
