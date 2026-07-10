import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private permissionService: PermissionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const pantallaId = route.data['pantallaId'];

      if (!pantallaId) {
        return true; // Si no hay pantalla requerida, permitimos acceso
      }

      const tieneAcceso = this.permissionService.tienePermiso(pantallaId, 'VER');

      if (tieneAcceso) {
        return true;
      }
    }

    // Redirigir si no tiene permisos
    this.router.navigate(['/dashboard']);
    return false;
  }
}
