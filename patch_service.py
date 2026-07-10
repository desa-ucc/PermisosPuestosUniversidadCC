import re

with open('./src/src/app/services/permission.service.ts', 'r') as f:
    content = f.read()

new_methods = """
  createRol(rol: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/seguridad/roles`, rol);
  }

  updateRol(id: number, rol: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/seguridad/roles/${id}`, rol);
  }

  deleteRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/seguridad/roles/${id}`);
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/seguridad/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/seguridad/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/seguridad/usuarios/${id}`);
  }

  updateSinglePermiso(id: number, permiso: Permiso): Observable<any> {
    return this.http.put(`${this.apiUrl}/seguridad/permisos/${id || 0}`, permiso);
  }
}
"""

content = re.sub(r'}\s*$', new_methods, content)

with open('./src/src/app/services/permission.service.ts', 'w') as f:
    f.write(content)
