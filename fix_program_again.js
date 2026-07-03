const fs = require('fs');

let programPath = 'PermisosPuestosApi/Program.cs';
let programContent = fs.readFileSync(programPath, 'utf8');

programContent = programContent.replace(
    /var logger = context\.HttpContext\.RequestServices\.GetRequiredService<ILogger<Program>>\(\);\s*logger\.LogError\("Error de Autenticación JWT: \{Message\}", context\.Exception\.Message\);/m,
    `var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Error de Autenticación JWT: {Message}", context.Exception.Message);
            Console.WriteLine($"Error de autenticación JWT: {context.Exception.Message}");`
);

fs.writeFileSync(programPath, programContent);
console.log('Program.cs patched with Console.WriteLine');
