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
