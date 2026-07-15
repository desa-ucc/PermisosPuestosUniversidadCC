using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PermisosPuestosApi.Models
{

    [Table("pt_Roles")]
    public class Rol
    {
        [Key] public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }

    [Table("pt_Usuarios")]
   public class Usuario
    {
        [Key] public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int RolId { get; set; }
        public bool Activo { get; set; }
    }

    [Table("pt_Permisos")]
    public class Permiso
    {
        [Key] public int Id { get; set; }
        public int RoleId { get; set; }
        public string PantallaId { get; set; } = string.Empty;
        public bool PuedeCrear { get; set; }
        public bool PuedeEditar { get; set; }
        public bool PuedeEliminar { get; set; }
        public bool PuedeVer { get; set; }
    }
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
    public string? CodigoPuesto { get; set; }
    public int? TipoHardwareId { get; set; }
    public string TipoEquipo { get; set; } = string.Empty;
    
    public string? Procesador { get; set; } 
    public string? Memoria { get; set; }
    public string? Disco { get; set; }
    public string? MarcaPC { get; set; }
    
    public string? OtrasConsideraciones { get; set; }
}

    public class HardwareAsignado
{
    [Key] public int Id { get; set; }
    public int EmpleadoId { get; set; }
    
    // Agrega estos campos para capturar el JOIN
    public string? CodigoPuesto { get; set; }
    public string? NombrePuesto { get; set; }
    
    public int? TipoHardwareId { get; set; }
    public string TipoEquipo { get; set; } = string.Empty;
    public string? Procesador { get; set; } 
    public string? Memoria { get; set; }
    public string? Disco { get; set; }
    public string? MarcaPC { get; set; }
    public string? OtrasConsideraciones { get; set; }
    public string Placa { get; set; } = string.Empty;
}

    public class SoftwareLocal
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
         public string? CodigoPuesto { get; set; }
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
        public string? CodigoPuesto { get; set; }
        public string Sitio { get; set; } = string.Empty;
        public string Ambiente { get; set; } = string.Empty;
        public string GruposPermisos { get; set; } = string.Empty;
    }

    public class Plataforma
    {
        [Key] public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string? CodigoPuesto { get; set; }
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
        public int RolId { get; set; }
    }

    public class UsuarioListDto 
    {
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; 
        public string NombreRol { get; set; } = string.Empty;
        public int RolId { get; set; }
        public bool Activo { get; set; }
    }

    public class UsuarioCreateDto
    {
        public string NombreUsuario { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int RolId { get; set; }
        public bool Activo { get; set; }
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

    public class PermisoDto
    {
        public string PantallaId { get; set; } = string.Empty;
        public bool PuedeVer { get; set; }
        public bool PuedeCrear { get; set; }
        public bool PuedeEditar { get; set; }
        public bool PuedeEliminar { get; set; }
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

    public class Cat_TiposHardware : CatalogoBase { }
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

    public class ReporteHardwareDto
    {
        public string Puesto { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Equipo { get; set; } = string.Empty;
        public string Procesador { get; set; } = string.Empty;
        public string Memoria { get; set; } = string.Empty;
        public string Disco { get; set; } = string.Empty;
        public string MarcaPC { get; set; } = string.Empty;
        public string OtrasConsideraciones { get; set; } = string.Empty;
    }

    public class ReporteSitioDto
    {
        public string Puesto { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Sitio { get; set; } = string.Empty;
        public string Ambiente { get; set; } = string.Empty;
        public string GruposPermisos { get; set; } = string.Empty;
    }

    public class ReportePlataformaDto
    {
        public string Puesto { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Licencias { get; set; } = string.Empty;
        public string Plataformas { get; set; } = string.Empty;
        public string Modulos { get; set; } = string.Empty;
        public string AccesosYPermisos { get; set; } = string.Empty;
        public string NivelAcceso { get; set; } = string.Empty;
    }

    public class ReporteIntegralResponse
    {
        public List<ReporteHardwareDto> Hardware { get; set; } = new();
        public List<ReporteSitioDto> Sitios { get; set; } = new();
        public List<ReportePlataformaDto> Plataformas { get; set; } = new();
    }
