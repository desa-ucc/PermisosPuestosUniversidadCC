const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Fix AuthController
const authPath = path.join('PermisosPuestosApi', 'Controllers', 'AuthController.cs');
let authContent = fs.readFileSync(authPath, 'utf8');

const loginQueryRaw = `var user = await _context.Database.SqlQueryRaw<UsuarioDto>(
                    "EXEC sp_Login @NombreUsuario={0}", request.Username
                ).FirstOrDefaultAsync();`;

const loginQueryFix = `var usernameParam = new SqlParameter("@NombreUsuario", request.Username);
                var usuarios = _context.UsuariosDto
                    .FromSqlRaw("EXEC sp_Login @NombreUsuario", usernameParam)
                    .AsEnumerable()
                    .ToList();
                var user = usuarios.FirstOrDefault();`;

authContent = authContent.replace(loginQueryRaw, loginQueryFix);
fs.writeFileSync(authPath, authContent);


// 2. Fix all other controllers using FromSqlRaw().ToListAsync() -> FromSqlRaw().AsEnumerable().ToList()
const controllersDir = path.join('PermisosPuestosApi', 'Controllers');
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
    if (file.endsWith('.cs') && file !== 'AuthController.cs') {
        const filePath = path.join(controllersDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // This regex looks for async calls, it might be tricky because ToListAsync is usually awaited.
        // We'll replace await ... .ToListAsync() with ... .AsEnumerable().ToList()
        // and remove await if it's there.

        content = content.replace(/await\s+([a-zA-Z0-9_\.]+\.FromSqlRaw\([^)]+\))\.ToListAsync\(\)/g, "$1.AsEnumerable().ToList()");

        fs.writeFileSync(filePath, content);
    }
});

console.log("All FromSqlRaw usages updated to use AsEnumerable().ToList()");
