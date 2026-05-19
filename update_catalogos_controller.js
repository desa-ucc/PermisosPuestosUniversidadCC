const fs = require('fs');
let content = fs.readFileSync('PermisosPuestosApi/Controllers/CatalogosController.cs', 'utf8');

// The file ends with two closing braces. We will replace the last two closing braces with the new methods + closing braces.
const newMethods = `
        // --- Nuevos Catálogos Plataformas (Read-Only) ---
        [HttpGet("NivelesAcceso")]
        public async Task<IActionResult> GetNivelesAcceso() => Ok(await _context.Cat_NivelesAccesos.FromSqlRaw("EXEC sp_GetNivelesAcceso").ToListAsync());

        [HttpGet("PlataformasNombres")]
        public async Task<IActionResult> GetPlataformasNombres() => Ok(await _context.Cat_PlataformasNombres.FromSqlRaw("EXEC sp_GetPlataformasNombres").ToListAsync());

        [HttpGet("TiposLicencia")]
        public async Task<IActionResult> GetTiposLicencia() => Ok(await _context.Cat_TiposLicencias.FromSqlRaw("EXEC sp_GetTiposLicencia").ToListAsync());
    }
}
`;

content = content.replace(/    \}\n\}\n?$/, newMethods);
fs.writeFileSync('PermisosPuestosApi/Controllers/CatalogosController.cs', content);
