const fs = require('fs');

// Fix app.component.ts
let tsContent = fs.readFileSync('src/src/app/app.component.ts', 'utf8');

tsContent = tsContent.replace(
  /private permissionService: PermissionService/g,
  'public permissionService: PermissionService'
);

fs.writeFileSync('src/src/app/app.component.ts', tsContent);
console.log('App TS fixed.');
