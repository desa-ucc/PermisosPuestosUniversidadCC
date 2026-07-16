const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

// The file still has stray variables due to some bad regexes.
// Let's grab the class portion, clean it, and make sure it has no duplicate or stray methods.
// The easiest is just rewriting the class body again cleanly to remove any trailing junk left behind.

const classStart = code.indexOf('export class BaseDatosComponent');
if (classStart !== -1) {
  let classContent = code.substring(classStart);
  // Find the first balanced bracket matching the class definition
  let depth = 0;
  let endPos = -1;
  for (let i = 0; i < classContent.length; i++) {
    if (classContent[i] === '{') depth++;
    if (classContent[i] === '}') {
      depth--;
      if (depth === 0) {
        endPos = i;
        break;
      }
    }
  }

  if (endPos !== -1) {
    let newClassContent = classContent.substring(0, endPos + 1);
    code = code.substring(0, classStart) + newClassContent;
    fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
    console.log("Trimmed trailing junk from class");
  }
}
