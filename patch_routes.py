import re

with open('./src/src/app/app.routes.ts', 'r') as f:
    content = f.read()

# Insert imports
imports_to_add = """
import { SeguridadComponent } from './components/seguridad/seguridad.component';
import { PermissionGuard } from './guards/permission.guard';
"""
# Find the last import and insert after it
content = re.sub(r'(import { AuthGuard } from \'./guards/auth.guard\';)', r'\1\n' + imports_to_add, content)

# Modify routes
# Existing catalogos route
# { path: 'catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
# Update the existing catalogos to include permission guard as requested if we want to follow it perfectly for all? The user asked to register the new /seguridad route. Let's do just the new route first, although adding permission guard to all is part of the architecture, I will add it to `seguridad` specifically and maybe `catalogos`. Wait, they just said: "Protección de Ruta: Registra la nueva ruta /seguridad en app.routes.ts. Es obligatorio que incluyas el canActivate: [PermissionGuard] y el data: { pantallaId: 'SEGURIDAD' }"

new_route = "  { path: 'seguridad', component: SeguridadComponent, canActivate: [AuthGuard, PermissionGuard], data: { pantallaId: 'SEGURIDAD' } },\n"
content = re.sub(r'({ path: \'reportes\', component: ReportesComponent, canActivate: \[AuthGuard\] },)', r'\1\n' + new_route, content)

with open('./src/src/app/app.routes.ts', 'w') as f:
    f.write(content)
