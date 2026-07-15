import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Obtener el token del localStorage
  const token = localStorage.getItem('token');

  // 2. Clonar la petición y agregar el header de Autorización si el token existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Pasar la petición al siguiente manejador e interceptar errores
  return next(authReq).pipe(
    catchError((error) => {
      // 4. Si el error es 401 Unauthorized (token faltante o expirado)
      if (error.status === 401) {
        console.warn('Acceso no autorizado o token expirado. Redirigiendo al login...');

        // Limpiar la sesión para evitar bucles
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('permisos');

        // Redirigir al login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
