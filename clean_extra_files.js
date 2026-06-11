const fs = require('fs');

fs.unlinkSync('./fix_reportes_toolbar.js');
fs.unlinkSync('./fix_reportes_toolbar2.js');

const path = './src/src/app/components/reportes/reportes.component.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('\\n              <table class="ucc-table min-w-[1000px]">', '              <table class="ucc-table min-w-[1000px]">');
fs.writeFileSync(path, content, 'utf8');

console.log('Cleaned');
