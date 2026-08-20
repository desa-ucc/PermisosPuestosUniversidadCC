# ==============================================================================
# ETAPA 1: CLONADOR / PREPARACIÓN DE CÓDIGO
# ==============================================================================
# Propósito: Preparar los archivos necesarios para la compilación, excluyendo basura.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS preparer
# Establecemos el directorio de trabajo donde procesaremos los archivos
WORKDIR /source
# Copiamos todo el contexto local (respetando el .dockerignore si existe)
COPY . .
# En este caso particular de desarrollo local, si usáramos git clone:
# ARG GIT_TOKEN
# RUN if [ -n "$GIT_TOKEN" ]; then git clone ...; rm -rf .git; fi

# ==============================================================================
# ETAPA 2: BUILD / PUBLICACIÓN
# ==============================================================================
# Propósito: Restaurar dependencias, compilar el proyecto y publicar los binarios
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Copiamos los archivos de proyecto (.csproj) preparados de la etapa 1
COPY --from=preparer /source/*.csproj ./
# Restauramos las dependencias
RUN dotnet restore "./PermisosPuestosApi.csproj"
# Copiamos el resto del código fuente preparado de la etapa 1
COPY --from=preparer /source/ ./
# Compilamos y publicamos el proyecto de manera óptima (modo Release)
RUN dotnet publish "PermisosPuestosApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# ETAPA 3: RUNTIME (PRODUCCIÓN)
# ==============================================================================
# Propósito: Crear una imagen final ligera, segura y lista para producción.
# Utilizamos la variante slim de ASP.NET Core para minimizar la superficie de ataque y el tamaño.
FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS final

# --- CONFIGURACIÓN DE ZONA HORARIA Y SEGURIDAD ---
# Configuramos la variable de entorno de zona horaria
ENV TZ=America/Costa_Rica

# Agrupamos instalaciones: instalamos tzdata de forma limpia,
# eliminamos herramientas de red peligrosas (wget, curl, ping) si existen,
# limpiamos caché y creamos un usuario no-root (appuser) y su grupo.
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    apt-get install -y --no-install-recommends bash && apt-get remove -y curl wget iputils-ping || true && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r appgroup && useradd -r -g appgroup appuser

# --- CONFIGURACIÓN DE LA APLICACIÓN ---
WORKDIR /app
# Copiamos los binarios publicados desde la etapa de build
COPY --from=build /app/publish .

# Cambiamos el propietario de los archivos al usuario no-root
RUN chown -R appuser:appgroup /app

# Definimos variables de entorno necesarias para la ejecución en .NET
# Habilitamos el puerto 5000 para el servicio
ENV ASPNETCORE_URLS=http://+:5000
# Puerto expuesto documentado
EXPOSE 5000

# Cambiamos al usuario no-root
USER appuser

# Punto de entrada de la aplicación
ENTRYPOINT ["dotnet", "PermisosPuestosApi.dll"]
