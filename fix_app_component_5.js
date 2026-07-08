const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'app.component.ts');
const newContent = `import { Component, OnInit } from '@angular/core';
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

  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    // Rehidratación de Estado inmediata (para refrescos de página)
    const token = localStorage.getItem('token');
    const permisosStr = sessionStorage.getItem('permisos');

    if (token) {
        if (permisosStr) {
             this.permissionService.cargarPermisosDesdeStorage();
             this.isLoggedIn = true;
        } else {
             if(window.location.pathname !== '/login') {
                 this.logout();
             }
        }
    } else {
        this.isLoggedIn = false;
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar en la página de login
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          if (localStorage.getItem('token') && !sessionStorage.getItem('permisos')) {
              this.permissionService.cargarPermisosDelUsuarioLogueado().subscribe({
                  error: err => console.error("Could not load permissions from API", err)
              });
          }
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('permisos');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
`;

fs.writeFileSync(filePath, newContent);
console.log("app.component updated correctly");
