const fs = require('fs');
let content = fs.readFileSync('src/src/app/components/puestos/puestos.component.ts', 'utf8');

// Replace standard input classes with ucc-input
content = content.replace(/class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary\/10 transition-all"/g, 'class="ucc-input"');
content = content.replace(/bg-primary-container text-white font-bold px-6 py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed/g, 'ucc-btn-primary w-full');
content = content.replace(/w-full bg-surface-container-high text-on-surface-variant font-bold px-6 py-2 rounded-lg hover:brightness-105 transition-all/g, 'ucc-btn-secondary w-full');

// Table container
content = content.replace(/<section class="bg-surface-container-lowest rounded-xl card-shadow border border-outline-variant\/20 overflow-hidden !bg-white">/g, '<section class="ucc-table-container">');
content = content.replace(/<table class="w-full text-left border-collapse">/g, '<table class="ucc-table">');

// Remove redundant classes that ucc-table handles
content = content.replace(/<tr class="bg-white border-b border-outline-variant\/30 text-on-surface">/g, '<tr>');
content = content.replace(/<tbody class="divide-y divide-outline-variant\/30">/g, '<tbody>');
content = content.replace(/<tr class="hover:bg-surface-container-low transition-colors">/g, '<tr>');

// Form container
content = content.replace(/<section class="bg-surface-container-lowest p-md rounded-xl card-shadow border border-outline-variant\/20 !bg-white">/g, '<section class="ucc-card">');

fs.writeFileSync('src/src/app/components/puestos/puestos.component.ts', content);
