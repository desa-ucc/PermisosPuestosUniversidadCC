const fs = require('fs');

const filesToFix = [
  {
    path: './src/src/app/components/colaboradores/colaboradores.component.ts',
    columns: ['Codigo', 'Nombre', 'Correo', 'Puesto'],
    props: ['codigoEmpleado', 'nombreCompleto', 'correoInstitucional', 'nombrePuesto']
  },
  {
    path: './src/src/app/components/hardware-ideal/hardware-ideal.component.ts',
    columns: ['Puesto', 'Equipo', 'Procesador', 'Memoria'],
    props: ['puestoId', 'tipoEquipo', 'procesador', 'memoria']
  },
  {
    path: './src/src/app/components/hardware/hardware.component.ts',
    columns: ['Puesto', 'Empleado', 'Equipo', 'Marca', 'Placa'],
    props: ['puestoId', 'empleadoId', 'tipoEquipo', 'marcaPC', 'placa']
  },
  {
    path: './src/src/app/components/software/software.component.ts',
    columns: ['Equipo', 'Software', 'Version', 'Fabricante'],
    props: ['empleadoId', 'nombreSoftware', 'version', 'fabricante']
  },
  {
    path: './src/src/app/components/sitios/sitios.component.ts',
    columns: ['Empleado', 'Sitio', 'Ambiente'],
    props: ['empleadoId', 'sitio', 'ambiente']
  },
  {
    path: './src/src/app/components/plataformas/plataformas.component.ts',
    columns: ['Empleado', 'Plataforma', 'Nivel'],
    props: ['empleadoId', 'nombrePlataforma', 'nivelAcceso']
  }
];

// Let's implement Colaboradores first manually. Wait, I should implement all of them.
// First, I will look at PuestosComponent to see how the filter was implemented there. Let's see... Wait, I couldn't find "filtro" in PuestosComponent. I should check again.
