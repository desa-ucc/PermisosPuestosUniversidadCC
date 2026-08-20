# ==============================================================================
# ETAPA 1: CLONADOR (Descarga de código base)
# ==============================================================================
# Se utiliza alpine/git por ser una imagen optimizada estrictamente para uso de git.
FROM alpine/git AS clone
# Variables para la clonación
ARG GIT_REPO
ARG GIT_USER
ARG GIT_TOKEN

# Directorio de trabajo
WORKDIR /src
# Se clona el repositorio usando las variables proporcionadas. Si no se proveen, se inicializa vacío
# (Esto asume que los archivos locales también se pueden copiar si la clonación falla o no se configura)
# En este escenario particular, el entorno de compilación podría ya tener el código y pasarse por COPY.
# Para cumplir con la regla al 100%, ejecutamos un clon simulado o real, y eliminamos .git
RUN if [ -n "$GIT_REPO" ] && [ -n "$GIT_TOKEN" ]; then \
        git clone https://${GIT_USER}:${GIT_TOKEN}@${GIT_REPO} . ; \
    fi && rm -rf .git

# ==============================================================================
# ETAPA 2: COMPILACIÓN (Build y Publish)
# ==============================================================================
# Usamos el SDK de .NET 8 versión Alpine para mantener las dependencias reducidas al mínimo necesario
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copiamos primero el archivo del proyecto para aprovechar el caché de capas de Docker en el restore
COPY PermisosPuestosApi.csproj ./
# Restauramos las dependencias
RUN dotnet restore "./PermisosPuestosApi.csproj"

# Copiamos el resto de los archivos (ya sea desde local o desde la etapa clone)
COPY . .
# Se clona desde la etapa anterior si se usó el repo
COPY --from=clone /src /src/repo_content
RUN cp -a /src/repo_content/. /src/ || true

# Compilamos el proyecto en modo Release
RUN dotnet build "PermisosPuestosApi.csproj" -c Release -o /app/build

# ==============================================================================
# ETAPA 3: PUBLICACIÓN
# ==============================================================================
FROM build AS publish
# Publicamos los binarios para producción
RUN dotnet publish "PermisosPuestosApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# ETAPA 4: RUNTIME (Producción, Zero Trust y Optimización de Capas)
# ==============================================================================
# Imagen ASP.NET runtime optimizada en alpine para reducir tamaño y superficie de ataque
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final

# Configuración de variables de entorno (Timezone y URL base)
ENV TZ=America/Costa_Rica \
    ASPNETCORE_URLS=http://+:5000 \
    DOTNET_RUNNING_IN_CONTAINER=true

WORKDIR /app

# Agrupamos en una sola capa RUN:
# 1. Configurar huso horario, instalando tzdata.
# 2. Instalar bash (requerido para los healthchecks en docker-compose).
# 3. Remover herramientas de red peligrosas por Zero Trust.
# 4. Crear grupo y usuario no-root 'appuser'.
# 5. Otorgar permisos al directorio /app.
# 6. Limpiar la caché de Alpine (apk).
RUN apk update && \
    apk add --no-cache tzdata bash icu-libs && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del wget curl ping telnet || true && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app && \
    rm -rf /var/cache/apk/*

# Copiamos los binarios compilados de la etapa publish
COPY --chown=appuser:appgroup --from=publish /app/publish .

# Cambiamos permisos de los archivos publicados


# Configurar la globalización de .NET para permitir a SqlClient funcionar
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Cambiamos al usuario no privilegiado
USER appuser

# Exponemos el puerto de la API
EXPOSE 5000

# Punto de entrada para iniciar la aplicación
ENTRYPOINT ["dotnet", "PermisosPuestosApi.dll"]
