import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Permiso {
  id?: number;
  roleId: number;
  pantallaId: string;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeVer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = environment.apiUrl;
  private permisosSubject = new BehaviorSubject<Permiso[]>([]);
  public permisos$ = this.permisosSubject.asObservable();

  constructor(private http: HttpClient) {}

  cargarPermisosDelUsuarioLogueado(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/seguridad/mis-permisos`).pipe(
      tap(permisos => {
        this.permisosSubject.next(permisos);
        localStorage.setItem('permisos', JSON.stringify(permisos));
      })
    );
  }

  cargarPermisosDesdeStorage(): void {
    const permisosStr = localStorage.getItem('permisos');
    if (permisosStr) {
      try {
        const permisos = JSON.parse(permisosStr);
        this.permisosSubject.next(permisos);
      } catch (e) {
        console.error('Error parsing permisos from storage', e);
      }
    }
  }

  tienePermiso(pantalla: string, accion: string): boolean {
    const permisos = this.permisosSubject.value;

    // Si no hay permisos cargados, intentar desde storage
    if (!permisos || permisos.length === 0) {
      this.cargarPermisosDesdeStorage();
    }

    const currentPermisos = this.permisosSubject.value;

    // Buscar el permiso para la pantalla especificada
    const permisoPantalla = currentPermisos.find(p => p.pantallaId.toUpperCase() === pantalla.toUpperCase());

    if (!permisoPantalla) {
      return false; // Si no hay configuración para la pantalla, denegar
    }

    switch (accion.toUpperCase()) {
      case 'CREAR':
        return permisoPantalla.puedeCrear;
      case 'EDITAR':
        return permisoPantalla.puedeEditar;
      case 'ELIMINAR':
        return permisoPantalla.puedeEliminar;
      case 'VER':
        return permisoPantalla.puedeVer;
      default:
        return false;
    }
  }

  // Métodos CRUD para administrar la seguridad (usados por el SeguridadComponent)
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/seguridad/roles`);
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/seguridad/usuarios`);
  }

  getPermisosPorRol(roleId: number): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/seguridad/roles/${roleId}/permisos`);
  }

  guardarPermisos(roleId: number, permisos: Permiso[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/seguridad/roles/${roleId}/permisos`, permisos);
  }
}
