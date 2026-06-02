const fs = require('fs');

let content = fs.readFileSync('PermisosPuestosApi/Controllers/ReportesController.cs', 'utf8');

const newMethod = `
        [HttpGet("integral/{termino}")]
        public async Task<IActionResult> GetReporteIntegral(string termino)
        {
            var p1 = new SqlParameter("@TerminoBusqueda", termino);
            var p2 = new SqlParameter("@TerminoBusqueda", termino);
            var p3 = new SqlParameter("@TerminoBusqueda", termino);

            var hw = await _context.ReportesHardwareDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralHardware @TerminoBusqueda", p1)
                .ToListAsync();

            var sit = await _context.ReportesSitiosDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralSitios @TerminoBusqueda", p2)
                .ToListAsync();

            var plat = await _context.ReportesPlataformasDto
                .FromSqlRaw("EXEC sp_GetReporteIntegralPlataformas @TerminoBusqueda", p3)
                .ToListAsync();

            var result = new ReporteIntegralResponse
            {
                Hardware = hw,
                Sitios = sit,
                Plataformas = plat
            };

            return Ok(result);
        }
    }
}
`;

content = content.replace(/    \}\n\}\n?$/, newMethod);
fs.writeFileSync('PermisosPuestosApi/Controllers/ReportesController.cs', content);
