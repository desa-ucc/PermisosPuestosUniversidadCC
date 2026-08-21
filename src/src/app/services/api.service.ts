import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Puesto, Empleado, HardwareIdeal, HardwareAsignado, SoftwareLocal, PermisosSitio, Plataforma, Catalogo, CatalogoNivelAcceso, ReportePerfil, ReporteIntegralResponse, AccesoBD } from '../models/models';

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
  // --- Auth ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  loginMicrosoft(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/msal-login`, { idToken });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/reset-password`, { token, newPassword });
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

  // --- Base de Datos ---
  getAccesosBD(): Observable<AccesoBD[]> { return this.http.get<AccesoBD[]>(`${this.apiUrl}/AccesosBD`, { headers: this.getHeaders() }); }
  createAccesoBD(data: Partial<AccesoBD>): Observable<AccesoBD> { return this.http.post<AccesoBD>(`${this.apiUrl}/AccesosBD`, data, { headers: this.getHeaders() }); }
  updateAccesoBD(id: number, data: Partial<AccesoBD>): Observable<any> { return this.http.put(`${this.apiUrl}/AccesosBD/${id}`, data, { headers: this.getHeaders() }); }
  deleteAccesoBD(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/AccesosBD/${id}`, { headers: this.getHeaders() }); }

  // --- Catalogos ---

  getTiposHardware(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/TiposHardware`, { headers: this.getHeaders() }); }
  getTipoHardware(id: number): Observable<Catalogo> { return this.http.get<Catalogo>(`${this.apiUrl}/Catalogos/TiposHardware/${id}`, { headers: this.getHeaders() }); }
  createTipoHardware(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/TiposHardware`, data, { headers: this.getHeaders() }); }
  updateTipoHardware(id: number, data: Partial<Catalogo>): Observable<any> { return this.http.put(`${this.apiUrl}/Catalogos/TiposHardware/${id}`, data, { headers: this.getHeaders() }); }
  deleteTipoHardware(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/TiposHardware/${id}`, { headers: this.getHeaders() }); }

  getAmbientes(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Ambientes`, { headers: this.getHeaders() }); }
  getAmbiente(id: number): Observable<Catalogo> { return this.http.get<Catalogo>(`${this.apiUrl}/Catalogos/Ambientes/${id}`, { headers: this.getHeaders() }); }
  createAmbiente(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Ambientes`, data, { headers: this.getHeaders() }); }
  updateAmbiente(id: number, data: Partial<Catalogo>): Observable<any> { return this.http.put(`${this.apiUrl}/Catalogos/Ambientes/${id}`, data, { headers: this.getHeaders() }); }
  deleteAmbiente(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Ambientes/${id}`, { headers: this.getHeaders() }); }

  getSitiosCat(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Sitios`, { headers: this.getHeaders() }); }
  getSitioCat(id: number): Observable<Catalogo> { return this.http.get<Catalogo>(`${this.apiUrl}/Catalogos/Sitios/${id}`, { headers: this.getHeaders() }); }
  createSitioCat(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Sitios`, data, { headers: this.getHeaders() }); }
  updateSitioCat(id: number, data: Partial<Catalogo>): Observable<any> { return this.http.put(`${this.apiUrl}/Catalogos/Sitios/${id}`, data, { headers: this.getHeaders() }); }
  deleteSitioCat(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Sitios/${id}`, { headers: this.getHeaders() }); }

  getPlataformasCat(): Observable<Catalogo[]> { return this.http.get<Catalogo[]>(`${this.apiUrl}/Catalogos/Plataformas`, { headers: this.getHeaders() }); }
  getPlataformaCat(id: number): Observable<Catalogo> { return this.http.get<Catalogo>(`${this.apiUrl}/Catalogos/Plataformas/${id}`, { headers: this.getHeaders() }); }
  createPlataformaCat(data: Partial<Catalogo>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/Plataformas`, data, { headers: this.getHeaders() }); }
  updatePlataformaCat(id: number, data: Partial<Catalogo>): Observable<any> { return this.http.put(`${this.apiUrl}/Catalogos/Plataformas/${id}`, data, { headers: this.getHeaders() }); }
  deletePlataformaCat(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/Plataformas/${id}`, { headers: this.getHeaders() }); }

  getNivelesAcceso(): Observable<CatalogoNivelAcceso[]> { return this.http.get<CatalogoNivelAcceso[]>(`${this.apiUrl}/Catalogos/NivelesAcceso`, { headers: this.getHeaders() }); }
  createNivelAcceso(data: Partial<CatalogoNivelAcceso>): Observable<any> { return this.http.post(`${this.apiUrl}/Catalogos/NivelesAcceso`, data, { headers: this.getHeaders() }); }
  updateNivelAcceso(id: number, data: Partial<CatalogoNivelAcceso>): Observable<any> { return this.http.put(`${this.apiUrl}/Catalogos/NivelesAcceso/${id}`, data, { headers: this.getHeaders() }); }
  deleteNivelAcceso(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/Catalogos/NivelesAcceso/${id}`, { headers: this.getHeaders() }); }

  // --- Reportes ---
  getReportePerfil(codigo: string): Observable<ReportePerfil[]> {
    return this.http.get<ReportePerfil[]>(`${this.apiUrl}/Reportes/perfil/${codigo}`, { headers: this.getHeaders() });
  }
  getReporteIntegral(termino: string): Observable<ReporteIntegralResponse> {
    return this.http.get<ReporteIntegralResponse>(`${this.apiUrl}/Reportes/integral/${termino}`, { headers: this.getHeaders() });
  }

  // --- Plataformas Nombres ---
  getPlataformasNombres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Catalogos/PlataformasNombres`);
  }

  getPlataformaNombre(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Catalogos/PlataformasNombres/${id}`);
  }

  createPlataformaNombre(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Catalogos/PlataformasNombres`, data);
  }

  updatePlataformaNombre(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Catalogos/PlataformasNombres/${id}`, data);
  }

  deletePlataformaNombre(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Catalogos/PlataformasNombres/${id}`);
  }

  // --- Tipos Licencia ---
  getTiposLicencia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Catalogos/TiposLicencia`);
  }

  getTipoLicencia(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Catalogos/TiposLicencia/${id}`);
  }

  createTipoLicencia(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Catalogos/TiposLicencia`, data);
  }

  updateTipoLicencia(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Catalogos/TiposLicencia/${id}`, data);
  }

  deleteTipoLicencia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Catalogos/TiposLicencia/${id}`);
  }

  // --- Importaciones Excel ---
  descargarPlantillaHardwareIdeal(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/HardwareIdeal/importar-ideal/plantilla`, { responseType: 'blob' });
  }

  importarHardwareIdeal(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/HardwareIdeal/importar-ideal`, formData);
  }

  descargarPlantillaHardwareAsignado(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/Equipos/importar-asignado/plantilla`, { responseType: 'blob' });
  }

  importarHardwareAsignado(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Equipos/importar-asignado`, formData);
  }
}
