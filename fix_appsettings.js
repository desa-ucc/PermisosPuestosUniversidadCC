const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'appsettings.json');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('MultipleActiveResultSets=true;')) {
    content = content.replace('TrustServerCertificate=True;Encrypt=False;"', 'TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=true;"');
    fs.writeFileSync(filePath, content);
}
console.log("appsettings updated");
