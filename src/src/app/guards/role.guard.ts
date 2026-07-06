import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private permissionService: PermissionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      // El nombre de la pantalla se pasa por los datos de la ruta en app.routes.ts
      const pantallaId = route.data['pantallaId'] as string;

      if (!pantallaId) {
          return true; // No route data provided, allow by default if AuthGuard passed
      }

      // Verificamos si el usuario tiene permiso 'VER' para esta pantalla
      const tieneAcceso = this.permissionService.tienePermiso(pantallaId, 'VER');

      if (tieneAcceso) {
        return true;
      } else {
        // Redirigir al dashboard si no tiene permisos
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
