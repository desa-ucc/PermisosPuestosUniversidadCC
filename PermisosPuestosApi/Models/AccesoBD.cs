using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PermisosPuestosApi.Models
{
    public class AccesoBDDto
    {
        public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string? NombreCompleto { get; set; }
        public string? CodigoPuesto { get; set; }
        public string? NombrePuesto { get; set; }
        public string Servidor { get; set; } = string.Empty;
        public string BaseDatos { get; set; } = string.Empty;
        public string NivelAcceso { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }

    public class AccesoBD
    {
        public int Id { get; set; }
        public int EmpleadoId { get; set; }
        public string Servidor { get; set; } = string.Empty;
        public string BaseDatos { get; set; } = string.Empty;
        public string NivelAcceso { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}
