const fs = require('fs');

// 1. Add log to SeguridadController
let controllerPath = 'PermisosPuestosApi/Controllers/SeguridadController.cs';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

controllerContent = controllerContent.replace(
    /public async Task<IActionResult> GetMisPermisos\(\)\s*\{/m,
    `public async Task<IActionResult> GetMisPermisos()
        {
            _logger.LogInformation("--- Petición recibida en /mis-permisos ---");
            _logger.LogInformation("Headers de la petición: {Headers}", Request.Headers["Authorization"]);
            _logger.LogInformation("Cantidad de Claims: {Count}", User.Claims.Count());
`
);
fs.writeFileSync(controllerPath, controllerContent);
console.log('Controller patched with init log');

// 2. Add JWT events to Program.cs
let programPath = 'PermisosPuestosApi/Program.cs';
let programContent = fs.readFileSync(programPath, 'utf8');

const jwtEvents = `
    x.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Error de Autenticación JWT: {Message}", context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Token JWT validado exitosamente.");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Token JWT recibido: {Token}", context.Token ?? "NO TOKEN");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Desafío de Autenticación emitido (401). Error: {Error}, Descripción: {ErrorDescription}", context.Error, context.ErrorDescription);
            return Task.CompletedTask;
        }
    };
`;

programContent = programContent.replace(
    /ValidateAudience = false \/\/ Set to true in production\s*};\s*\}\);/m,
    'ValidateAudience = false // Set to true in production\n    };\n' + jwtEvents + '\n});'
);

fs.writeFileSync(programPath, programContent);
console.log('Program.cs patched with JWT events');
