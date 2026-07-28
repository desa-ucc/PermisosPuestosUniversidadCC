# Proyecto Permisos X Puesto

Este proyecto es una solución integral para la gestión de permisos, hardware y software por puesto de trabajo para la Universidad Castro Carazo.

## Requisitos
- SQL Server alojado en `172.29.99.8`
- Docker y Docker Compose instalados.

## 1. Inicialización de la Base de Datos

Ejecute el script monolítico `InitDB.sql` directamente en el SQL Server (`172.29.99.8`).
Este script creará la base de datos `ProyectoPermisos` y todas las tablas junto a sus Stored Procedures.

El script crea un usuario administrador por defecto:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 2. Despliegue con Docker

Ejecuta el siguiente comando en la raíz del proyecto para construir y levantar los contenedores de la API (.NET) y el Frontend (Angular):

```bash
docker-compose up --build -d
```

## 3. Accesos

- **Frontend:** http://localhost:4200
- **Backend API (Swagger):** http://localhost:5000/swagger

Utilice las credenciales del usuario semilla para ingresar en el frontend:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## Arquitectura y Reglas

- **Base de datos Externa:** No se incluye contenedor de DB, todo apunta a 172.29.99.8.
- **Backend (.NET 8):** Expone endpoints protegidos con JWT que interactúan con la BD **100% a través de Stored Procedures (0 LINQ)**.
- **Frontend (Angular 17):** Implementa todo el CRUD de Puestos, Empleados, Hardware y Software simulando un Excel interactivo. Incluye Dark Mode con TailwindCSS.
/audit
