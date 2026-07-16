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
  codigoPuesto?: string;
  nombrePuesto?: string;
  tipoHardwareId?: number;
  tipoEquipo: string;
  procesador: string;
  memoria: string;
  disco: string;
  marcaPC: string;
  otrasConsideraciones: string;
}

export interface HardwareAsignado {
  id: number;
  empleadoId: number;
  codigoPuesto?: string;
  nombrePuesto?: string;
  tipoHardwareId?: number;
  tipoEquipo: string;
  procesador: string;
  memoria: string;
  disco: string;
  marcaPC: string;
  otrasConsideraciones: string;
  placa: string;
}

export interface SoftwareLocal {
  id: number;
  empleadoId: number;
  codigoPuesto?: string;
  nombrePuesto?: string;
  equipo: string;
  gruposAD: string;
  nombreSoftware: string;
  version: string;
  fabricante: string;
}

export interface PermisosSitio {
  id: number;
  empleadoId: number;
  codigoPuesto?: string;
  nombrePuesto?: string;
  sitio: string;
  ambiente: string;
  gruposPermisos: string;
}

export interface Plataforma {
  id: number;
  empleadoId: number;
  codigoPuesto?: string;
  nombrePuesto?: string;
  nombrePlataforma: string;
  licencias: string;
  modulos: string;
  accesosPermisos: string;
  nivelAcceso: string;
}

export interface Catalogo {
  id: number;
  nombre: string;
}

export interface CatalogoNivelAcceso extends Catalogo {
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export interface ReportePerfil {
  codigoEmpleado: string;
  empleado: string;
  perfil: string;
  equipo: string;
  placaEquipo: string;
  software: string;
  versionSoftware: string;
  plataforma: string;
  estadoLicencia: string;
  costoEstimadoHardware: number;
  costoEstimadoLicencias: number;
}

export interface ReporteHardware {
  puesto: string;
  nombre: string;
  equipo: string;
  procesador: string;
  memoria: string;
  disco: string;
  marcaPC: string;
  otrasConsideraciones: string;
}

export interface ReporteSitio {
  puesto: string;
  nombre: string;
  sitio: string;
  ambiente: string;
  gruposPermisos: string;
}

export interface ReportePlataforma {
  puesto: string;
  nombre: string;
  licencias: string;
  plataformas: string;
  modulos: string;
  accesosYPermisos: string;
  nivelAcceso: string;
}

export interface ReporteIntegralResponse {
  hardware: ReporteHardware[];
  sitios: ReporteSitio[];
  plataformas: ReportePlataforma[];
}

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
