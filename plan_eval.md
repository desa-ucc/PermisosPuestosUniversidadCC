## Análisis de Impacto Arquitectónico: Unificación de Catálogos (Sitios, Tipos de Plataformas y Nombres de Plataformas)

El objetivo propuesto consiste en refactorizar las tablas físicas `pt_Sitios`, `pt_TiposPlataformas` y `pt_PlataformasNombres` (todas con estructura genérica ID, Nombre, Estado) en una sola tabla polimórfica (ej. `pt_CatalogosDinamicos`) con un discriminador `TipoCatalogo`, logrando también fusionar la lógica en Backend y Frontend.

Tras una evaluación exhaustiva de los archivos del repositorio, se exponen los siguientes impactos técnicos y el veredicto arquitectónico.

### 1. Dependencias en Base de Datos (SQL Server)

**Estructura y Migración:**
- **Llaves Foráneas Actuales:** Varias tablas transaccionales y de asociación dependen intrínsecamente del ID de estas tablas:
  - Los permisos de sitios (`PermisosSitio`) asocian Usuarios o Puestos con identificadores específicos extraídos de `pt_Sitios`.
  - Las `Plataformas` transaccionales almacenan referencias que ligan Puestos con Plataformas/Licencias, probablemente guardando las llaves originadas desde `pt_TiposPlataformas` y `pt_PlataformasNombres`.
- **Complejidad de Migración:** Altamente compleja y riesgosa. Al consolidar tres tablas en una (`pt_CatalogosDinamicos`), los IDs numéricos (PK autoincrementales) **entrarán en conflicto de colisión**. Por ejemplo, el Sitio ID=1 ("Avatar") chocará con la Plataforma ID=1 ("Web").
- **Coste de Resolución:** Requeriría regenerar completamente las llaves (surrogate keys o un esquema compuesto), lo cual obliga a actualizar cascada abajo **todos** los registros de todas las tablas dependientes (`pt_PermisosSitios`, `pt_Plataformas_Puesto`, etc.) o reescribir los JOINs de los Stored Procedures para coincidir también con el discriminador.

### 2. Impacto en el Backend (.NET 8)

- **Controladores y Modelos:**
  - El archivo `CatalogosController.cs` requerirá una cirugía mayor:
    - Borrar los ~15 endpoints (GET, POST, PUT, DELETE) individuales para `Sitios`, `Plataformas` y `PlataformasNombres`.
    - Crear un nuevo bloque CRUD que reciba el discriminador en el route o en el body `[HttpGet("{tipoCatalogo}")]`.
  - El modelo de datos (`Models.cs` y `AppDbContext.cs`) debería eliminar los `DbSet` específicos (`Cat_Sitio`, `Cat_Plataforma`, `Cat_PlataformasNombres`) y agruparlos en un `Cat_CatalogoDinamico`.
- **Stored Procedures:** Cada uno de los SPs subyacentes (`sp_GestionarSitios`, `sp_GestionarTiposPlataformas`, `sp_GestionarPlataformasNombres`) y sus respectivas Vistas deben combinarse en un único `sp_GestionarCatalogoDinamico` introduciendo una capa más de abstracción `@TipoCatalogo`. Esto podría impactar negativamente en los planes de ejecución si la tabla crece en volumen heterogéneo.

### 3. Impacto en el Frontend (Angular 17)

- **Consolidación en Vista de Catálogos:** La vista `catalogos.component.ts` sería más limpia, permitiendo iterar arrays genéricos basados en el tab activo (como de hecho ya lo hace de cierta forma).
- **Impacto Colateral Crítico (Comboboxes):** A nivel del resto del sistema, los componentes transaccionales (`SitiosComponent`, `PlataformasComponent`, e interfaces de reportes) tendrían que modificar sus inyecciones del servicio `ApiService` para no llamar a `getSitiosCat()` o `getPlataformasNombres()`, sino a algo como `getCatalogo('SITIO')`.
- **Impacto a gran escala:** Se tendría que hacer una búsqueda y reemplazo exhaustivo a través de docenas de componentes reactivos donde estos catálogos inicializan los selectores (dropdowns) de la interfaz de usuario.

### Veredicto Arquitectónico

**No se recomienda proceder con esta refactorización en este punto del ciclo de vida del proyecto.**

El esfuerzo de ingeniería requerido, los altos riesgos de integridad referencial (colisión de PKs) a nivel de la base de datos SQL Server y la cantidad de refactorización colateral justifican mantener el patrón actual.

Adicionalmente, el patrón actual **(Tablas Físicas Separadas)** adhiere al principio **Single Responsibility Principle (SRP)**:
- **Flexibilidad Futura:** Si el negocio dictamina mañana que un *Sitio* debe incluir una columna obligatoria "IP Local" o que una *Plataforma* requiera un campo "Dominio / Tenant ID", la estructura segregada permite agregar estos campos de forma atómica. Usar una tabla genérica (`pt_CatalogosDinamicos`) obligaría a usar columnas tipo `AtributoExtra1` o un bloque JSON rompiendo el esquema relacional o llenando la tabla de valores NULL.
- **Acoplamiento de seguridad:** El sistema actual maneja RBAC (`puedecrear`, `puedeeliminar`... etc). Agrupar todo podría implicar mezclar el monitoreo, complicando la delegación de permisos a usuarios específicos que solo deban administrar *Sitios* pero no *Plataformas*.

*Recomendación:* Se sugiere mantener el esquema desacoplado existente, el cual proporciona mayor mantenibilidad vertical y está explícitamente preparado para el escalamiento de los atributos funcionales en las próximas iteraciones.
