const fs = require('fs');
let code = fs.readFileSync('PermisosPuestosApi/Data/AppDbContext.cs', 'utf8');

if (!code.includes('public DbSet<AccesoBDDto> AccesosBDDto')) {
    code = code.replace(
        'public DbSet<ReportePlataformaDto> ReportesPlataformasDto { get; set; }',
        'public DbSet<ReportePlataformaDto> ReportesPlataformasDto { get; set; }\n        public DbSet<AccesoBDDto> AccesosBDDto { get; set; }'
    );

    code = code.replace(
        'modelBuilder.Entity<ReportePlataformaDto>().HasNoKey();',
        'modelBuilder.Entity<ReportePlataformaDto>().HasNoKey();\n            modelBuilder.Entity<AccesoBDDto>().HasNoKey();'
    );

    fs.writeFileSync('PermisosPuestosApi/Data/AppDbContext.cs', code);
    console.log("Updated AppDbContext.cs");
}
