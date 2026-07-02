import { Component, OnInit } from '@angular/core';
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
  ];

  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar en la página de login
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          // If we just logged in, load permissions (and also load from storage on refresh)
          if (localStorage.getItem('token')) {
              this.permissionService.cargarPermisosDesdeStorage();
              this.permissionService.cargarPermisosDelUsuarioLogueado().subscribe({
                  error: err => console.error("Could not load permissions from API", err)
              });
          }
      } else if (this.isLoggedIn) {
          // just a navigation event but we are already logged in, ensure we have permissions in state if they exist in storage
          this.permissionService.cargarPermisosDesdeStorage();
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('permisos');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
