const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'Data', 'AppDbContext.cs');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('DbSet<Permiso> Permisos')) {
    content = content.replace('public DbSet<UsuarioDto> UsuariosDto { get; set; }', 'public DbSet<UsuarioDto> UsuariosDto { get; set; } \n        public DbSet<Permiso> Permisos { get; set; }');
}

if (!content.includes('modelBuilder.Entity<Permiso>().HasNoKey();')) {
     content = content.replace('modelBuilder.Entity<UsuarioDto>().HasNoKey();', 'modelBuilder.Entity<UsuarioDto>().HasNoKey(); \n            modelBuilder.Entity<Permiso>().HasNoKey();');
}
fs.writeFileSync(filePath, content);
console.log("AppDbContext updated");
