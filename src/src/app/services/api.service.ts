import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- Auth ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  // --- Puestos ---
  getPuestos(): Observable<Puesto[]> { return this.http.get<Puesto[]>(`${this.apiUrl}/Puestos`, { headers: this.getHeaders() }); }
  createPuesto(data: Partial<Puesto>): Observable<Puesto> { return this.http.post<Puesto>(`${this.apiUrl}/Puestos`, data, { headers: this.getHeaders() }); }
  updatePuesto(id: number, data: Partial<Puesto>): Observable<any> { return this.http.put(`${this.apiUrl}/Puestos/${id}`, data, { headers: this.getHeaders() }); }
  deletePuesto(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Puestos/${id}`, { headers: this.getHeaders() }); }

  // --- Empleados ---
  getEmpleados(): Observable<Empleado[]> { return this.http.get<Empleado[]>(`${this.apiUrl}/Empleados`, { headers: this.getHeaders() }); }
  createEmpleado(data: Partial<Empleado>): Observable<Empleado> { return this.http.post<Empleado>(`${this.apiUrl}/Empleados`, data, { headers: this.getHeaders() }); }
  updateEmpleado(id: number, data: Partial<Empleado>): Observable<any> { return this.http.put(`${this.apiUrl}/Empleados/${id}`, data, { headers: this.getHeaders() }); }
  deleteEmpleado(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Empleados/${id}`, { headers: this.getHeaders() }); }

  // --- Equipos Ideales ---
  getHardwareIdeal(): Observable<HardwareIdeal[]> { return this.http.get<HardwareIdeal[]>(`${this.apiUrl}/HardwareIdeal`, { headers: this.getHeaders() }); }
  createHardwareIdeal(data: Partial<HardwareIdeal>): Observable<HardwareIdeal> { return this.http.post<HardwareIdeal>(`${this.apiUrl}/HardwareIdeal`, data, { headers: this.getHeaders() }); }
  updateHardwareIdeal(id: number, data: Partial<HardwareIdeal>): Observable<any> { return this.http.put(`${this.apiUrl}/HardwareIdeal/${id}`, data, { headers: this.getHeaders() }); }
  deleteHardwareIdeal(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/HardwareIdeal/${id}`, { headers: this.getHeaders() }); }

  // --- Equipos Asignados ---
  getHardwareAsignado(): Observable<HardwareAsignado[]> { return this.http.get<HardwareAsignado[]>(`${this.apiUrl}/Equipos/Asignado`, { headers: this.getHeaders() }); }
  createHardwareAsignado(data: Partial<HardwareAsignado>): Observable<HardwareAsignado> { return this.http.post<HardwareAsignado>(`${this.apiUrl}/Equipos/Asignado`, data, { headers: this.getHeaders() }); }
  updateHardwareAsignado(id: number, data: Partial<HardwareAsignado>): Observable<any> { return this.http.put(`${this.apiUrl}/Equipos/Asignado/${id}`, data, { headers: this.getHeaders() }); }
  deleteHardwareAsignado(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Equipos/Asignado/${id}`, { headers: this.getHeaders() }); }

  // --- Software Local ---
  getSoftwareLocales(): Observable<SoftwareLocal[]> { return this.http.get<SoftwareLocal[]>(`${this.apiUrl}/Software/Local`, { headers: this.getHeaders() }); }
  createSoftwareLocal(data: Partial<SoftwareLocal>): Observable<SoftwareLocal> { return this.http.post<SoftwareLocal>(`${this.apiUrl}/Software/Local`, data, { headers: this.getHeaders() }); }
  updateSoftwareLocal(id: number, data: Partial<SoftwareLocal>): Observable<any> { return this.http.put(`${this.apiUrl}/Software/Local/${id}`, data, { headers: this.getHeaders() }); }
  deleteSoftwareLocal(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Software/Local/${id}`, { headers: this.getHeaders() }); }

  // --- Permisos Sitio ---
  getPermisosSitios(): Observable<PermisosSitio[]> { return this.http.get<PermisosSitio[]>(`${this.apiUrl}/PermisosSitios`, { headers: this.getHeaders() }); }
  createPermisosSitio(data: Partial<PermisosSitio>): Observable<PermisosSitio> { return this.http.post<PermisosSitio>(`${this.apiUrl}/PermisosSitios`, data, { headers: this.getHeaders() }); }
  updatePermisosSitio(id: number, data: Partial<PermisosSitio>): Observable<any> { return this.http.put(`${this.apiUrl}/PermisosSitios/${id}`, data, { headers: this.getHeaders() }); }
  deletePermisosSitio(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/PermisosSitios/${id}`, { headers: this.getHeaders() }); }

  // --- Plataformas ---
  getPlataformas(): Observable<Plataforma[]> { return this.http.get<Plataforma[]>(`${this.apiUrl}/Plataformas`, { headers: this.getHeaders() }); }
  createPlataforma(data: Partial<Plataforma>): Observable<Plataforma> { return this.http.post<Plataforma>(`${this.apiUrl}/Plataformas`, data, { headers: this.getHeaders() }); }
  updatePlataforma(id: number, data: Partial<Plataforma>): Observable<any> { return this.http.put(`${this.apiUrl}/Plataformas/${id}`, data, { headers: this.getHeaders() }); }
  deletePlataforma(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Plataformas/${id}`, { headers: this.getHeaders() }); }

  // --- Catalogos ---
  getAmbientes(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Ambientes`, { headers: this.getHeaders() }); }
  createAmbiente(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Ambientes`, data, { headers: this.getHeaders() }); }
  deleteAmbiente(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Ambientes/${id}`, { headers: this.getHeaders() }); }

  getSitiosCat(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Sitios`, { headers: this.getHeaders() }); }
  createSitioCat(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Sitios`, data, { headers: this.getHeaders() }); }
  deleteSitioCat(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Sitios/${id}`, { headers: this.getHeaders() }); }

  getPlataformasCat(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Plataformas`, { headers: this.getHeaders() }); }
  createPlataformaCat(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Plataformas`, data, { headers: this.getHeaders() }); }
  deletePlataformaCat(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Plataformas/${id}`, { headers: this.getHeaders() }); }
}
