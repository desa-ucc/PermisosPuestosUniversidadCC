with open('/app/src/src/app/app.routes.ts', 'r') as f:
    content = f.read()

import re

search = """import { AuthGuard } from './guards/auth.guard';"""
replace = """import { AuthGuard } from './guards/auth.guard';
import { SeguridadComponent } from './components/seguridad/seguridad.component';"""

content = content.replace(search, replace)

search2 = """  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },"""
replace2 = """  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },
  { path: 'seguridad', component: SeguridadComponent, canActivate: [AuthGuard] },"""

content = content.replace(search2, replace2)

with open('/app/src/src/app/app.routes.ts', 'w') as f:
    f.write(content)
