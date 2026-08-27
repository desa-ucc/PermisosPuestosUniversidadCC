# ==============================================================================
# ETAPA 1: CLONADOR / PREPARACIÓN DE CÓDIGO
# ==============================================================================
# Propósito: Preparar los archivos necesarios para la compilación, excluyendo basura.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS preparer
WORKDIR /source
# Copiamos todo el contexto local
COPY . .

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
# Copiamos el resto del código fuente preparado
COPY --from=preparer /source/ ./
# Compilamos y publicamos el proyecto de manera óptima (modo Release)
RUN dotnet publish "PermisosPuestosApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# ETAPA 3: RUNTIME (PRODUCCIÓN)
# ==============================================================================
# Propósito: Crear una imagen final ligera, segura y lista para producción (slim).
FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS final

# --- CONFIGURACIÓN DE ZONA HORARIA Y SEGURIDAD ---
# Configuramos la variable de entorno de zona horaria a Costa Rica
ENV TZ=America/Costa_Rica

USER root
# (Debian bug on this docker in docker in podman env)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# --- CONFIGURACIÓN DE LA APLICACIÓN ---
WORKDIR /app
# Copiamos los binarios publicados desde la etapa de build
COPY --from=build /app/publish .

# Cambiamos el propietario de los archivos al usuario no-root
RUN chown -R appuser:appgroup /app

# Definimos variables de entorno necesarias para la ejecución en .NET
ENV ASPNETCORE_URLS=http://+:5000

# Puerto expuesto para documentación y uso por docker-compose
EXPOSE 5000

# Aplicamos principio de mínimo privilegio cambiando al usuario no-root
USER appuser

# Punto de entrada de la aplicación API .NET
ENTRYPOINT ["dotnet", "PermisosPuestosApi.dll"]
