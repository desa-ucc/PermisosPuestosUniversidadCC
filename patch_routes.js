const fs = require('fs');
let code = fs.readFileSync('src/src/app/app.routes.ts', 'utf8');

if (!code.includes('BaseDatosComponent')) {
    code = code.replace(
        "import { PlataformasComponent } from './components/plataformas/plataformas.component';",
        "import { PlataformasComponent } from './components/plataformas/plataformas.component';\nimport { BaseDatosComponent } from './components/base-datos/base-datos.component';"
    );

    code = code.replace(
        "{ path: 'plataformas', component: PlataformasComponent, canActivate: [AuthGuard] },",
        "{ path: 'plataformas', component: PlataformasComponent, canActivate: [AuthGuard] },\n  { path: 'base-datos', component: BaseDatosComponent, canActivate: [AuthGuard] },"
    );

    fs.writeFileSync('src/src/app/app.routes.ts', code);
    console.log("Updated app.routes.ts");
}
