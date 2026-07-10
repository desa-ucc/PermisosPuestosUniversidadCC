import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
    { link: '/catalogos', label: 'Catálogos Base', icon: 'folder_shared', pantallaId: 'CATALOGOS' },
    { link: '/dashboard', label: 'Dashboard', icon: 'dashboard', pantallaId: 'DASHBOARD' },
    { link: '/puestos', label: 'Puestos', icon: 'badge', pantallaId: 'PUESTOS' },
    { link: '/colaboradores', label: 'Colaboradores', icon: 'group', pantallaId: 'COLABORADORES' },
    { link: '/hardware-ideal', label: 'Equipo Ideal', icon: 'verified_user', pantallaId: 'EQUIPO_IDEAL' },
    { link: '/hardware', label: 'Hardware Asignado', icon: 'computer', pantallaId: 'HARDWARE' },
    { link: '/software', label: 'Software Local', icon: 'terminal', pantallaId: 'SOFTWARE_LOCAL' },
    { link: '/sitios', label: 'Permisos Sitios', icon: 'location_on', pantallaId: 'PERMISOS_SITIOS' },
    { link: '/plataformas', label: 'Plataformas', icon: 'cloud_done', pantallaId: 'PLATAFORMAS' },
    { link: '/reportes', label: 'Reportes', icon: 'analytics', pantallaId: 'REPORTES' },
    { link: '/seguridad', label: 'Seguridad y Accesos', icon: 'security', pantallaId: 'SEGURIDAD' }

  ];
  filteredMenu$: Observable<any[]>;

constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {
    this.filteredMenu$ = this.permissionService.permisos$.pipe(
      map(permisos => this.menuItems.filter(item => this.permissionService.tienePermiso(item.pantallaId, 'VER')))
    );
  }

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
