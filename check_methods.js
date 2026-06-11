const fs = require('fs');

const filesToFix = [
  './src/src/app/components/reportes/reportes.component.ts',
  './src/src/app/components/hardware-ideal/hardware-ideal.component.ts',
  './src/src/app/components/hardware/hardware.component.ts',
  './src/src/app/components/software/software.component.ts',
  './src/src/app/components/sitios/sitios.component.ts',
  './src/src/app/components/plataformas/plataformas.component.ts'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let match;
  let regex = /seleccionar[A-Za-z0-9_]+\([^)]*\)\s*\{[\s\S]*?\n  \}/g;
  console.log(`\n--- ${file} ---`);
  while ((match = regex.exec(content)) !== null) {
    console.log(match[0]);
  }
});
