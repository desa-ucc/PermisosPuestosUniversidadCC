const fs = require('fs');

const filesToFix = [
  './src/src/app/components/reportes/reportes.component.ts',
  './src/src/app/components/hardware-ideal/hardware-ideal.component.ts',
  './src/src/app/components/hardware/hardware.component.ts',
  './src/src/app/components/software/software.component.ts',
  './src/src/app/components/sitios/sitios.component.ts',
  './src/src/app/components/plataformas/plataformas.component.ts'
];

// Reviso y aplico el fix de mousedown en lugar de click a todos los li de los dropdowns
// porque el blur se dispara antes que el click del li.

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/\(click\)="seleccionar/g, '(mousedown)="seleccionar');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed mousedown in ${file}`);
  } else {
    console.log(`No changes for mousedown in ${file}`);
  }
});
