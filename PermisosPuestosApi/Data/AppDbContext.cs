using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UsuarioDto> UsuariosDto { get; set; }
        public DbSet<UsuarioSsoDto> UsuariosSsoDto { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<Puesto> Puestos { get; set; }
        public DbSet<EmpleadoDto> EmpleadosDto { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<HardwareIdeal> HardwareIdeales { get; set; }
        public DbSet<HardwareAsignado> HardwareAsignados { get; set; }
        public DbSet<SoftwareLocal> SoftwareLocales { get; set; }
        public DbSet<PermisosSitio> PermisosSitios { get; set; }
        public DbSet<Plataforma> Plataformas { get; set; }
        public DbSet<Cat_TiposHardware> Cat_TiposHardware { get; set; }
        public DbSet<Cat_Ambiente> Cat_Ambientes { get; set; }
        public DbSet<Cat_Sitio> Cat_Sitios { get; set; }
        public DbSet<Cat_Plataforma> Cat_Plataformas { get; set; }
        public DbSet<Cat_NivelesAcceso> Cat_NivelesAccesos { get; set; }
        public DbSet<Cat_PlataformasNombres> Cat_PlataformasNombres { get; set; }
        public DbSet<Cat_TiposLicencia> Cat_TiposLicencias { get; set; }
        public DbSet<ReportePerfilDto> ReportesPerfilDto { get; set; }
        public DbSet<ReporteHardwareDto> ReportesHardwareDto { get; set; }
        public DbSet<ReporteSitioDto> ReportesSitiosDto { get; set; }
        public DbSet<ReportePlataformaDto> ReportesPlataformasDto { get; set; }
        public DbSet<AccesoBDDto> AccesosBDDto { get; set; }

                public DbSet<ReporteAccesoBDDto> ReportesBasesDatosDto { get; set; }
        public DbSet<ReporteSoftwareLocalDto> ReportesSoftwareLocalDto { get; set; }
        public DbSet<ReporteBaseDto> ReportesBaseDto { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UsuarioDto>().HasNoKey();
            modelBuilder.Entity<PermisoDto>().HasNoKey();
            modelBuilder.Entity<EmpleadoDto>().HasNoKey();
            modelBuilder.Entity<PermisosSitio>().HasNoKey().ToView(null);
            modelBuilder.Entity<SoftwareLocal>().HasNoKey().ToView(null);


            // DTOs for Reporting
            modelBuilder.Entity<ReportePerfilDto>().HasNoKey();
            modelBuilder.Entity<ReportePerfilDto>()
                .Property(r => r.CostoEstimadoHardware)
                .HasPrecision(18, 2);
            modelBuilder.Entity<ReportePerfilDto>()
                .Property(r => r.CostoEstimadoLicencias)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ReporteHardwareDto>().HasNoKey();
            modelBuilder.Entity<ReporteSitioDto>().HasNoKey();
            modelBuilder.Entity<ReportePlataformaDto>().HasNoKey();
            modelBuilder.Entity<AccesoBDDto>().HasNoKey();
                    modelBuilder.Entity<ReporteAccesoBDDto>().HasNoKey();
            modelBuilder.Entity<ReporteSoftwareLocalDto>().HasNoKey();
            modelBuilder.Entity<ReporteBaseDto>().HasNoKey();
        }
    }
}
