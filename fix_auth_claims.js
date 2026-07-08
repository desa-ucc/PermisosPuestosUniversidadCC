const fs = require('fs');
const path = require('path');

// Models.cs update for RoleId
const modelsPath = path.join('PermisosPuestosApi', 'Models', 'Models.cs');
let modelsContent = fs.readFileSync(modelsPath, 'utf8');

if (!modelsContent.includes('public int RolId { get; set; }')) {
    modelsContent = modelsContent.replace('public string NombreRol { get; set; } = string.Empty;', 'public string NombreRol { get; set; } = string.Empty;\n        public int RolId { get; set; }');
    fs.writeFileSync(modelsPath, modelsContent);
}

// AuthController update for Claim
const authPath = path.join('PermisosPuestosApi', 'Controllers', 'AuthController.cs');
let authContent = fs.readFileSync(authPath, 'utf8');

if (!authContent.includes('new Claim("RolId"')) {
    authContent = authContent.replace('new Claim(ClaimTypes.Role, user.NombreRol)', 'new Claim(ClaimTypes.Role, user.NombreRol),\n                    new Claim("RolId", user.RolId.ToString())');
    fs.writeFileSync(authPath, authContent);
}

console.log("Updated Models and AuthController for RolId");
