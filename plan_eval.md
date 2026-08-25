**Acciones para Backend:**
- Editar `PermisosSitiosController.cs`:
  - `DescargarPlantillaPermisosSitio()` (GET) -> `Codigo Empleado`, `Sitio`, `Ambiente`, `Grupos y Permisos`
  - `ImportarPermisosSitio(IFormFile file)` (POST) -> `SqlQueryRaw` a `pt_Empleados` para código. Pasar parámetros nulos como `N/A`. Retornar payload esperado.
- Editar `PlataformasController.cs`:
  - `DescargarPlantillaPlataformas()` (GET) -> `Codigo Empleado`, `Nombre de la Plataforma`, `Tipo de Licencia`, `Módulos`, `Accesos y Permisos`, `Nivel de Acceso`
  - `ImportarPlataformas(IFormFile file)` (POST) -> `SqlQueryRaw` a `pt_Empleados`. Validar o No? El prompt habla de buscar catalogos. PERO los controladores de SP de Plataformas y PermisosSitios actualmente insertan como STRING libre los catalogos `Sitio`, `Ambiente`, `NombrePlataforma`, `Licencias`, `NivelAcceso`.
  - Let's check this on DB Context or SP variables. Actually wait:
     - The previous task: "En la vista de Plataformas, reemplaza los combobox estáticos de 'Licencia' y 'Plataforma' para que consuman estos nuevos endpoints."
     - Plataforma class has:
       `public string NombrePlataforma { get; set; } = string.Empty;`
       `public string Licencias { get; set; } = string.Empty;`
       `public string NivelAcceso { get; set; } = string.Empty;`
     - PermisosSitio class has:
       `public string Sitio { get; set; } = string.Empty;`
       `public string Ambiente { get; set; } = string.Empty;`
     So the SP just expects Strings directly. We don't necessarily have to query the catalog IDs, but the prompt says: "con el reto adicional de que aquí el backend no solo debe buscar al empleado, sino que también debe buscar en los catálogos (Sitios, Tipos de Licencia, Nombres de Plataforma) para traducir el texto del Excel a IDs numéricos."

Ah, wait, if the database takes strings (as the properties suggest and as we can see in CreatePlataforma above `new SqlParameter("@n", p.NombrePlataforma)`), passing IDs would throw a Type conversion error or store IDs as strings.
Let's see if the prompt strictly mandates translating to IDs:
"sino que también debe buscar en los catálogos (Sitios, Tipos de Licencia, Nombres de Plataforma) para traducir el texto del Excel a IDs numéricos... Mapeo Seguro con Proyecciones (Crítico): Al buscar los IDs a partir de los textos del Excel (ya sea buscando en pt_Empleados, pt_Sitios, pt_PlataformasNombres o pt_TiposLicencia), utiliza únicamente .Select(x => x.Id)"

Wait, let's verify if `pt_Sitios` exists or not and how SPs act. We'll query using `SqlQueryRaw` as requested to validate existence, but pass whatever string is expected or ID? Actually, `sp_GestionarPermisosSitios` likely has parameters. Let's just validate existence via `SELECT Id AS Value FROM pt_Sitios WHERE Nombre = {0}` and then pass the actual string since the controller normally passes the string. Or pass the ID if that's what's meant. We'll pass what's provided by default. If the current method `CreatePlataforma` passes `p.NombrePlataforma` (string), we will pass the string but we can validate it.

**Acciones para Frontend:**
- Angular: `sitios.component.ts` y `plataformas.component.ts`. Agregar botones, HTML de modal y métodos Excel import.
