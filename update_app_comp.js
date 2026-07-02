const fs = require('fs');

let tsContent = fs.readFileSync('src/src/app/app.component.ts', 'utf8');

const updatedTs = `import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { PermissionService } from './services/permission.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ProyectoPermisosXPuesto';
  isLoggedIn = false;
  permisosCargados = false;

  menuItems = [
    { pantallaId: 'DASHBOARD', nombre: 'Dashboard', ruta: '/dashboard', icon: 'dashboard' },
    { pantallaId: 'CATALOGOS', nombre: 'Catálogos Base', ruta: '/catalogos', icon: 'folder_shared' },
    { pantallaId: 'PUESTOS', nombre: 'Puestos', ruta: '/puestos', icon: 'badge' },
    { pantallaId: 'COLABORADORES', nombre: 'Colaboradores', ruta: '/colaboradores', icon: 'group' },
    { pantallaId: 'EQUIPO_IDEAL', nombre: 'Equipo Ideal', ruta: '/hardware-ideal', icon: 'verified_user' },
    { pantallaId: 'HARDWARE', nombre: 'Hardware Asignado', ruta: '/hardware', icon: 'computer' },
    { pantallaId: 'SOFTWARE_LOCAL', nombre: 'Software Local', ruta: '/software', icon: 'terminal' },
    { pantallaId: 'PERMISOS_SITIOS', nombre: 'Permisos Sitios', ruta: '/sitios', icon: 'location_on' },
    { pantallaId: 'PLATAFORMAS', nombre: 'Plataformas', ruta: '/plataformas', icon: 'cloud_done' },
    { pantallaId: 'REPORTES', nombre: 'Reportes', ruta: '/reportes', icon: 'analytics' },
    { pantallaId: 'SEGURIDAD', nombre: 'Seguridad y Acceso', ruta: '/seguridad', icon: 'security' }
  ];

  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    // Escuchar cambios de permisos
    this.permissionService.permisos$.subscribe(permisos => {
      if (permisos && permisos.length > 0) {
        this.permisosCargados = true;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar en la página de login
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          if (localStorage.getItem('token')) {
              this.permissionService.cargarPermisosDesdeStorage();
              this.permissionService.cargarPermisosDelUsuarioLogueado().subscribe({
                  error: err => console.error("Could not load permissions from API", err)
              });
          }
      } else if (this.isLoggedIn) {
          this.permissionService.cargarPermisosDesdeStorage();
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('permisos');
    this.isLoggedIn = false;
    this.permisosCargados = false;
    this.router.navigate(['/login']);
  }
}
`;
fs.writeFileSync('src/src/app/app.component.ts', updatedTs);
console.log('app.component.ts updated');
