import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  private apiUrl = 'http://localhost:5000/api/seguridad'; // Should use environment ideally

  constructor(private http: HttpClient) {}

  // Roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  createRol(rol: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, rol);
  }

  updateRol(id: number, rol: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${id}`, rol);
  }

  deleteRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }

  // Usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // Permisos
  getPermisos(rolId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/permisos/${rolId}`);
  }

  updatePermiso(permiso: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/permisos`, permiso);
  }
}
