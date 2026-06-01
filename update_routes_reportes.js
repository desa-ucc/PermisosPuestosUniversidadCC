const fs = require('fs');

let content = fs.readFileSync('src/src/app/app.routes.ts', 'utf8');

content = content.replace(
  /import { PlataformasComponent } from '\.\/components\/plataformas\/plataformas.component';/,
  `import { PlataformasComponent } from './components/plataformas/plataformas.component';\nimport { ReportesComponent } from './components/reportes/reportes.component';`
);

content = content.replace(
  /\{ path: 'plataformas', component: PlataformasComponent, canActivate: \[AuthGuard\] \},/,
  `{ path: 'plataformas', component: PlataformasComponent, canActivate: [AuthGuard] },\n  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },`
);

fs.writeFileSync('src/src/app/app.routes.ts', content);
