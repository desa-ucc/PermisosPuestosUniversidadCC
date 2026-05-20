const fs = require('fs');

const files = [
  'src/src/app/components/hardware/hardware.component.ts',
  'src/src/app/components/hardware-ideal/hardware-ideal.component.ts',
  'src/src/app/components/software/software.component.ts',
  'src/src/app/components/sitios/sitios.component.ts',
  'src/src/app/components/plataformas/plataformas.component.ts',
  'src/src/app/components/catalogos/catalogos.component.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Generic replacements for all UI components to use the UCC design system
  content = content.replace(/p-6/g, 'p-gutter max-w-container-max-width mx-auto space-y-8');
  content = content.replace(/<h2 class="text-2xl font-bold mb-4"/g, '<div class="mb-8"><h2 class="font-headline-lg text-headline-lg text-ucc-secondary"');
  content = content.replace(/<\/h2>/g, '</h2><p class="font-body-lg text-body-lg text-ucc-neutral-variant mt-1">Gestión administrativa de los registros y asignaciones.</p></div>');

  content = content.replace(/<form .*? class="bg-gray-800 p-4 rounded mb-6.*?>/g, (match) => {
    return `<section class="ucc-card mb-8">\n<div class="flex items-center gap-2 mb-6 text-ucc-secondary"><span class="material-symbols-outlined">edit_document</span><h3 class="text-xl font-bold">Formulario de Registro</h3></div>\n` + match.replace(/class="[^"]*"/, '');
  });
  content = content.replace(/<\/form>/g, '</form>\n</section>');

  content = content.replace(/class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"/g, 'class="ucc-input"');
  content = content.replace(/class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full"/g, 'class="ucc-input"');

  // Specific inputs
  content = content.replace(/<input formControlName="([^"]+)" placeholder="([^"]+)" class="ucc-input">/g, (match, p1, p2) => {
      return `<label class="ucc-label">${p2}</label>\n<input formControlName="${p1}" placeholder="${p2}" class="ucc-input">`;
  });
  content = content.replace(/<select formControlName="([^"]+)"(?:\s+\(change\)="[^"]*")?\s+class="ucc-input">/g, (match) => {
    return `<label class="ucc-label">Seleccione Opción</label>\n` + match.replace('ucc-input', 'ucc-select');
  });

  // Buttons
  content = content.replace(/class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"/g, 'class="ucc-btn-primary"');
  content = content.replace(/class="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-200"/g, 'class="ucc-btn-secondary"');

  // Tables
  content = content.replace(/<div class="overflow-x-auto">\s*<table class="w-full text-left border-collapse rounded-lg overflow-hidden">/g, '<section class="ucc-table-container">\n<div class="p-6 flex justify-between items-center border-b border-ucc-neutral-outline/20 bg-ucc-secondary"><h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">table_chart</span> Registros Actuales</h3></div>\n<table class="ucc-table">');
  content = content.replace(/<tr class="bg-gray-700 text-gray-200">/g, '<tr>');
  content = content.replace(/<th class="p-3 border-b border-gray-600 font-semibold"/g, '<th');
  content = content.replace(/<tr class="bg-gray-800 hover:bg-gray-700 transition border-b border-gray-700 last:border-0">/g, '<tr>');
  content = content.replace(/<td class="p-3">/g, '<td>');
  content = content.replace(/<td class="p-3 text-center">/g, '<td>');

  content = content.replace(/class="text-blue-400 mr-3 hover:text-blue-300 font-medium transition" title="Editar"/g, 'class="p-2 text-ucc-secondary hover:bg-ucc-secondary/10 rounded-full transition-all" title="Editar"');
  content = content.replace(/class="text-red-400 hover:text-red-300 font-medium transition" title="Eliminar"/g, 'class="p-2 text-ucc-error hover:bg-ucc-error/10 rounded-full transition-all" title="Eliminar"');

  content = content.replace(/<\/table>\s*<\/div>/g, '</table>\n</section>');

  fs.writeFileSync(file, content);
});
