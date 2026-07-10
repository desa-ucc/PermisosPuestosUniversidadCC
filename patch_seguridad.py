import re

with open('./src/src/app/components/seguridad/seguridad.component.ts', 'r') as f:
    content = f.read()

# Replace imports to include PermisoDirective
content = re.sub(r"import \{ PermissionService, Permiso \} from '../../services/permission.service';", r"import { PermissionService, Permiso } from '../../services/permission.service';\nimport { PermisoDirective } from '../../directives/permiso.directive';", content)

# Include PermisoDirective in imports array
content = re.sub(r"imports: \[CommonModule, FormsModule, ReactiveFormsModule\]", r"imports: [CommonModule, FormsModule, ReactiveFormsModule, PermisoDirective]", content)

# Add the *appPermiso directive to the button
content = re.sub(r'(<button \(click\)="abrirModalPermisos\(rol\)" class="ucc-btn-primary flex items-center gap-2 px-3 py-1 text-sm rounded-full">)', r'<button *appPermiso="{pantalla: \'SEGURIDAD\', accion: \'EDITAR\'}" (click)="abrirModalPermisos(rol)" class="ucc-btn-primary flex items-center gap-2 px-3 py-1 text-sm rounded-full">', content)


with open('./src/src/app/components/seguridad/seguridad.component.ts', 'w') as f:
    f.write(content)
