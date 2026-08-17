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
  isMobileMenuOpen = false;
  filteredMenu$: Observable<any[]>;

  // Propiedad dinâmica para el usuario logueado en el header
  user: any = {
    name: 'Usuario'
  };

  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {
    this.filteredMenu$ = this.permissionService.permisos$.pipe(
      map(permisos => {
        const menuBase = [
          { link: '/catalogos', label: 'Catálogos Base', icon: 'folder_shared', pantallaId: 'CATALOGOS' },
          { link: '/dashboard', label: 'Panel', icon: 'dashboard', pantallaId: 'DASHBOARD' },
          { link: '/puestos', label: 'Puestos', icon: 'badge', pantallaId: 'PUESTOS' },
          { link: '/colaboradores', label: 'Colaboradores', icon: 'group', pantallaId: 'COLABORADORES' },
          { link: '/hardware-ideal', label: 'Equipo Ideal', icon: 'verified_user', pantallaId: 'EQUIPO_IDEAL' },
          { link: '/hardware', label: 'Hardware Asignado', icon: 'computer', pantallaId: 'HARDWARE' },
          { link: '/software', label: 'Software Local', icon: 'terminal', pantallaId: 'SOFTWARE_LOCAL' },
          { link: '/sitios', label: 'Permisos Sitios', icon: 'location_on', pantallaId: 'PERMISOS_SITIOS' },
          { link: '/plataformas', label: 'Plataformas', icon: 'cloud_done', pantallaId: 'PLATAFORMAS' },
          { link: '/reportes', label: 'Reportes', icon: 'analytics', pantallaId: 'REPORTES' },
          { link: '/seguridad', label: 'Seguridad y Accesos', icon: 'security', pantallaId: 'SEGURIDAD' },
          { link: '/base-datos', label: 'Base de Datos', icon: 'database', pantallaId: 'ADMINBASEDATOS' }
        ];

        let finalMenu: any[] = [];

        permisos.forEach(p => {
            if (p.puedeVer) {
                const baseInfo = menuBase.find(m => m.pantallaId.toUpperCase() === p.pantallaId.toUpperCase());

                if (baseInfo) {
                    finalMenu.push(baseInfo);
                } else {
                    finalMenu.push({
                        link: '/' + p.pantallaId.toLowerCase().replace(/_/g, '-'),
                        label: p.pantallaId,
                        icon: 'extension',
                        pantallaId: p.pantallaId
                    });
                }
            }
        });

        return finalMenu;
      })
    );
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          if (localStorage.getItem('token')) {
              this.permissionService.cargarPermisosDesdeStorage();
              this.cargarDatosUsuario();
          }
      } else if (this.isLoggedIn) {
          this.permissionService.cargarPermisosDesdeStorage();
          this.cargarDatosUsuario();
      }
      this.isMobileMenuOpen = false; 
    });
  }

  cargarDatosUsuario() {
    // 1. Intenta obtener el nombre directamente si se guardó en el login
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    if (nombreGuardado) {
      this.user = { name: nombreGuardado };
      return;
    }

    // 2. Si no, intenta decodificarlo dinámicamente desde el JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.user = {
          name: payload.unique_name || payload.name || payload.sub || 'Usuario'
        };
      } catch (e) {
        this.user = { name: 'Usuario' };
      }
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('permisos');
    localStorage.removeItem('nombreUsuario');
    this.isLoggedIn = false;
    this.isMobileMenuOpen = false;
    this.router.navigate(['/login']);
  }
}