const fs = require('fs');
const path = require('path');

const controllers = ['SeguridadController.cs', 'ReportesController.cs'];
controllers.forEach(c => {
    const filePath = path.join('PermisosPuestosApi', 'Controllers', c);
    let content = fs.readFileSync(filePath, 'utf8');

    // For these files, the ToListAsync is on a newline
    content = content.replace(/\.ToListAsync\(\)/g, ".AsEnumerable().ToList()");
    content = content.replace(/await\s+(_context\.[a-zA-Z0-9_\.]+\s*\.FromSqlRaw)/g, "$1");

    fs.writeFileSync(filePath, content);
});
console.log("Remaining files updated");
