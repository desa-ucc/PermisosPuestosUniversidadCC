using System;
using System.ComponentModel.DataAnnotations;

namespace PermisosPuestosApi.Models
{
    public class Puesto
    {
        [Key] public int Id { get; set; }
        public string CodigoPuesto { get; set; } = string.Empty;
        public string NombrePuesto { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }

    public class Empleado
    {
        [Key] public int Id { get; set; }
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string CorreoInstitucional { get; set; } = string.Empty;
        public int? PuestoId { get; set; }
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
    }

    public class HardwareIdeal
    {
        [Key] public int Id { get; set; }
        public int PuestoId { get; set; }
        public string TipoEquipo { get; set; } = string.Empty;
        public string Procesador { get; set; } = string.Empty;
        public string Memoria { get; set; } = string.Empty;
        public string Disco { get; set; } = string.Empty;
        public string MarcaPC { get; set; } = string.Empty;
        public bool TecladoNumerico { get; set; }
        public string? OtrasConsideraciones { get; set; }
    }

    public class HardwareAsignado
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string TipoEquipo { get; set; } = string.Empty;
        public string Procesador { get; set; } = string.Empty;
        public string Memoria { get; set; } = string.Empty;
        public string Disco { get; set; } = string.Empty;
        public string MarcaPC { get; set; } = string.Empty;
        public bool TecladoNumerico { get; set; }
        public string? OtrasConsideraciones { get; set; }
        public string Placa { get; set; } = string.Empty;
    }

    public class SoftwareLocal
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string Equipo { get; set; } = string.Empty;
        public string GruposAD { get; set; } = string.Empty;
        public string NombreSoftware { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Fabricante { get; set; } = string.Empty;
    }

    public class PermisosSitio
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string Sitio { get; set; } = string.Empty;
        public string Ambiente { get; set; } = string.Empty;
        public string GruposPermisos { get; set; } = string.Empty;
    }

    public class Plataforma
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string NombrePlataforma { get; set; } = string.Empty;
        public string Licencias { get; set; } = string.Empty;
        public string Modulos { get; set; } = string.Empty;
        public string AccesosPermisos { get; set; } = string.Empty;
        public string NivelAcceso { get; set; } = string.Empty;
    }

    public class UsuarioDto
    {
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string NombreRol { get; set; } = string.Empty;
    }

    public class EmpleadoDto
    {
        public int Id { get; set; }
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string CorreoInstitucional { get; set; } = string.Empty;
        public int? PuestoId { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string? NombrePuesto { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

    public class CatalogoBase
    {
        [Key] public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }

    public class Cat_Ambiente : CatalogoBase { }
    public class Cat_Sitio : CatalogoBase { }
    public class Cat_Plataforma : CatalogoBase { }
    public class Cat_NivelesAcceso : CatalogoBase { }
    public class Cat_PlataformasNombres : CatalogoBase { }
    public class Cat_TiposLicencia : CatalogoBase { }

    public class ReportePerfilDto
    {
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string Empleado { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
        public string Equipo { get; set; } = string.Empty;
        public string PlacaEquipo { get; set; } = string.Empty;
        public string Software { get; set; } = string.Empty;
        public string VersionSoftware { get; set; } = string.Empty;
        public string Plataforma { get; set; } = string.Empty;
        public string EstadoLicencia { get; set; } = string.Empty;
        public decimal CostoEstimadoHardware { get; set; }
        public decimal CostoEstimadoLicencias { get; set; }
    }
