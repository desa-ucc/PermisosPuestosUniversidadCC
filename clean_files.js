const fs = require('fs');

fs.unlinkSync('./fix_colaboradores2.js');
fs.unlinkSync('./fix_hardware2.js');
fs.unlinkSync('./fix_hardware_ideal2.js');
fs.unlinkSync('./fix_plataformas2.js');
fs.unlinkSync('./fix_puestos.js');
fs.unlinkSync('./fix_sitios2.js');
fs.unlinkSync('./fix_software2.js');

console.log('Cleaned');
