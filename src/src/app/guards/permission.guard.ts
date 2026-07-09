import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const pantallaRequerida = route.data['pantallaId'] as string;

  if (pantallaRequerida && permissionService.tienePermiso(pantallaRequerida, 'VER')) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
