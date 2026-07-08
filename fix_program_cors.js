const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'Program.cs');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure correct CORS ordering, before useRouting or useAuth, just before UseAuthentication
// actually let's just make sure it uses what the user asked
const replaceCors = `builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});`;

content = content.replace(/builder\.Services\.AddCors\([\s\S]*?\}\);\n\}\);/g, replaceCors);

// Check if app.UseCors("AllowAll"); is present before UseAuthentication
if (content.includes('app.UseCors("AllowAll");')) {
    // it's already there
}

fs.writeFileSync(filePath, content);
console.log("CORS updated");
