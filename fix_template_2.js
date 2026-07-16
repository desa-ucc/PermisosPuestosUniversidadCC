const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

code = code.replace(/template:\s*<div/, 'template: `\n    <div');

// The file was likely broken around line 196 because of missing \`
// Let's replace the whole template with a clean one
const startTemplate = code.indexOf('template: `');
const nextBrace = code.indexOf('})', startTemplate);

if (startTemplate !== -1 && nextBrace !== -1) {
  let templateContent = code.substring(startTemplate, nextBrace);
  if (!templateContent.endsWith('`\n')) {
     code = code.substring(0, nextBrace) + '\n`\n' + code.substring(nextBrace);
  }
}
fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Fixed template tick");
