const fs = require('fs');
let content = fs.readFileSync('./src/src/app/components/sitios/sitios.component.ts', 'utf8');
let match;
let regex = /seleccionar[A-Za-z0-9_]+\([^)]*\)\s*\{[\s\S]*?\n  \}/g;
while ((match = regex.exec(content)) !== null) {
  console.log(match[0]);
}
