using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UsuarioDto> UsuariosDto { get; set; }
        public DbSet<Puesto> Puestos { get; set; }
        public DbSet<EmpleadoDto> EmpleadosDto { get; set; }
        public DbSet<ReportePerfilDto> ReportesPerfilDto { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<HardwareIdeal> HardwareIdeales { get; set; }
        public DbSet<HardwareAsignado> HardwareAsignados { get; set; }
        public DbSet<SoftwareLocal> SoftwareLocales { get; set; }
        public DbSet<PermisosSitio> PermisosSitios { get; set; }
        public DbSet<Plataforma> Plataformas { get; set; }
        public DbSet<Cat_Ambiente> Cat_Ambientes { get; set; }
        public DbSet<Cat_Sitio> Cat_Sitios { get; set; }
        public DbSet<Cat_Plataforma> Cat_Plataformas { get; set; }
        public DbSet<Cat_NivelesAcceso> Cat_NivelesAccesos { get; set; }
        public DbSet<Cat_PlataformasNombres> Cat_PlataformasNombres { get; set; }
        public DbSet<Cat_TiposLicencia> Cat_TiposLicencias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UsuarioDto>().HasNoKey();
            modelBuilder.Entity<EmpleadoDto>().HasNoKey();
            modelBuilder.Entity<ReportePerfilDto>().HasNoKey();
        }
    }
}
