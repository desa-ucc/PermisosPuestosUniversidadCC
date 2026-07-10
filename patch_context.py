import re

with open('./PermisosPuestosApi/Data/AppDbContext.cs', 'r') as f:
    content = f.read()

models = """
            modelBuilder.Entity<RolDto>().HasNoKey();
            modelBuilder.Entity<UsuarioResponseDto>().HasNoKey();
"""

content = re.sub(r'(modelBuilder\.Entity<UsuarioDto>\(\)\.HasNoKey\(\);)', r'\1' + models, content)

with open('./PermisosPuestosApi/Data/AppDbContext.cs', 'w') as f:
    f.write(content)
