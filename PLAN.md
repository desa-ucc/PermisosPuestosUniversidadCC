# PLAN: ProyectoPermisosXPuesto

## Arquitectura y Pasos de Ejecución

1. **Creación de la Base de Datos (`InitDB.sql`)**
   - Escribir script monolítico para crear tablas normalizadas con cláusulas `IF NOT EXISTS`.
   - Incluir tablas de Seguridad (Usuarios, Roles, Permisos), Colaboradores (Empleados, Puestos), Hardware (Equipos Ideales, Equipos Asignados) y Software/Accesos (Software Local, Permisos Sitio, Plataformas).
   - Crear Stored Procedures (SPs) para el CRUD completo de cada tabla para cumplir la regla de 100% SPs y CERO LINQ.
   - Insertar usuario administrador semilla con contraseña SHA256 (`admin123`).

2. **Desarrollo del Backend (.NET 8 - `/PermisosPuestosApi/`)**
   - Crear solución y proyecto Web API en .NET 8.
   - Configurar Entity Framework Core para mapear llamadas a SPs usando `FromSqlRaw` / `ExecuteSqlRaw`.
   - Crear modelos correspondientes a las tablas de la BD.
   - Implementar JWT Auth y Hashing (SHA256).
   - Crear los Controladores (API endpoints) para exponer los SPs.
   - Configurar CORS y Swagger.

3. **Desarrollo del Frontend (Angular 17 - `/src/`)**
   - Inicializar proyecto Angular 17.
   - Instalar Tailwind CSS y configurar el "Dark Mode" por defecto.
   - Instalar `ngx-charts` para el Dashboard interactivo.
   - Crear servicios HTTP para interactuar con la API.
   - Implementar Guards (`AuthGuard`) e Interceptores JWT.
   - Crear componentes (Pantallas): Login, Dashboard, Colaboradores y Puestos, Hardware, Software y Accesos.
   - Implementar formularios reactivos para todo el CRUD simulando las capacidades del Excel previo.

4. **Configuración de Docker y Despliegue**
   - Crear `Dockerfile` para la API (.NET).
   - Crear `Dockerfile` para el Frontend (Angular + Nginx).
   - Crear `docker-compose.yml` en la raíz para levantar ambos contenedores, configurando las variables de entorno para que se conecte a la IP `172.29.99.8` de SQL Server.

5. **Documentación (`README.md`)**
   - Detallar instrucciones de despliegue, URLs locales, credenciales de administrador y pasos para la ejecución del script SQL.

6. **Auditoría Final**
   - Revisión de requisitos y entrega de reporte de calidad final `/audit`.
