import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Se inyecta PLATFORM_ID para proteger de SSR
  ) {}

  canActivate(): boolean {
    // Evitamos el error "localStorage is not defined" que deja la pantalla en blanco durante el SSR de Angular 17
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      }
    }

    // Redirección explícita usando el Router
    this.router.navigate(['/login']);
    return false;
  }
}
