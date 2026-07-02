with open('/app/src/src/app/app.component.ts', 'r') as f:
    content = f.read()

import re

search = """export class AppComponent implements OnInit {
  title = 'ProyectoPermisosXPuesto';
  isLoggedIn = false;"""

replace = """export class AppComponent implements OnInit {
  title = 'ProyectoPermisosXPuesto';
  isLoggedIn = false;

  menuItems = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard', pantalla: 'DASHBOARD' },
    { name: 'Catálogos Base', icon: 'folder_shared', route: '/catalogos', pantalla: 'CATALOGOS' },
    { name: 'Puestos', icon: 'badge', route: '/puestos', pantalla: 'PUESTOS' },
    { name: 'Colaboradores', icon: 'group', route: '/colaboradores', pantalla: 'COLABORADORES' },
    { name: 'Equipo Ideal', icon: 'verified_user', route: '/hardware-ideal', pantalla: 'HARDWARE_IDEAL' },
    { name: 'Hardware Asignado', icon: 'computer', route: '/hardware', pantalla: 'HARDWARE' },
    { name: 'Software Local', icon: 'terminal', route: '/software', pantalla: 'SOFTWARE' },
    { name: 'Permisos Sitios', icon: 'location_on', route: '/sitios', pantalla: 'SITIOS' },
    { name: 'Plataformas', icon: 'cloud_done', route: '/plataformas', pantalla: 'PLATAFORMAS' },
    { name: 'Reportes', icon: 'analytics', route: '/reportes', pantalla: 'REPORTES' },
    { name: 'Seguridad', icon: 'shield_person', route: '/seguridad', pantalla: 'SEGURIDAD' }
  ];"""

content = content.replace(search, replace)

constructor_search = """  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}"""

constructor_replace = """  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {}"""

content = content.replace(constructor_search, constructor_replace)

with open('/app/src/src/app/app.component.ts', 'w') as f:
    f.write(content)
