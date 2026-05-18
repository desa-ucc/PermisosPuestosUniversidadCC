export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreRol: string;
}

export interface Puesto {
  id: number;
  codigoPuesto: string;
  nombrePuesto: string;
  descripcion: string;
}

export interface Empleado {
  id: number;
  codigoEmpleado: string;
  nombreCompleto: string;
  correoInstitucional: string;
  puestoId?: number;
  nombrePuesto?: string;
  fechaRegistro?: Date;
}

export interface HardwareIdeal {
  id: number;
  puestoId: number;
  tipoEquipo: string;
  procesador: string;
  memoria: string;
  disco: string;
  marcaPC: string;
  tecladoNumerico: boolean;
  otrasConsideraciones: string;
}

export interface HardwareAsignado {
  id: number;
  empleadoId: number;
  tipoEquipo: string;
  procesador: string;
  memoria: string;
  disco: string;
  marcaPC: string;
  tecladoNumerico: boolean;
  otrasConsideraciones: string;
  placa: string;
}

export interface SoftwareLocal {
  id: number;
  empleadoId: number;
  equipo: string;
  gruposAD: string;
  nombreSoftware: string;
  version: string;
  fabricante: string;
}

export interface PermisosSitio {
  id: number;
  empleadoId: number;
  sitio: string;
  ambiente: string;
  gruposPermisos: string;
}

export interface Plataforma {
  id: number;
  empleadoId: number;
  nombrePlataforma: string;
  licencias: string;
  modulos: string;
  accesosPermisos: string;
  nivelAcceso: string;
}
