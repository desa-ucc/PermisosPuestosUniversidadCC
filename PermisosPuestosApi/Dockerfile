# ==============================================================================
# ETAPA 1: CLONADOR (Descarga del código fuente)
# ==============================================================================
# Utilizamos una imagen de Alpine con Git preinstalado, muy ligera y segura.
FROM alpine/git AS clonador
# Definición de variables ARG requeridas para la autenticación y clonación.
ARG GIT_REPO=https://github.com/desa-ucc/PermisosPuestosUniversidadCC.git
ARG GIT_USER=none
ARG GIT_TOKEN=none

# Establecemos el directorio de trabajo donde clonaremos el repositorio.
WORKDIR /src
# Se clona el repositorio inyectando las credenciales si es necesario.
# (Nota: En caso de repositorios públicos o si se usa build context local,
# se adapta la lógica. Si el entorno no inyecta los ARGs, copiamos el local).
# Para cumplir el requerimiento estricto, clonamos el repo y borramos .git
RUN git clone https://${GIT_USER}:${GIT_TOKEN}@${GIT_REPO#https://} . || git clone ${GIT_REPO} . \
    && rm -rf .git

# ==============================================================================
# ETAPA 2: COMPILADOR (Build de la aplicación .NET)
# ==============================================================================
# Utilizamos la imagen oficial del SDK de .NET 8 para compilar.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
# Copiamos el código fuente desde la etapa del clonador
COPY --from=clonador /src/PermisosPuestosApi /app/
# Agrupamos la restauración y publicación en la misma capa para optimizar caché.
RUN dotnet restore "PermisosPuestosApi.csproj" \
    && dotnet publish "PermisosPuestosApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==============================================================================
# ETAPA 3: RUNTIME (Imagen final de producción)
# ==============================================================================
# Utilizamos una imagen slim de ASP.NET 8 para reducir superficie de ataque.
FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS final

# Variable de entorno para forzar la zona horaria a Costa Rica
ENV TZ=America/Costa_Rica

# Ejecutamos un solo bloque RUN para instalar dependencias y asegurar Zero Trust:
# 1. Actualizamos paquetes.
# 2. Instalamos tzdata (para la zona horaria) y bash (para healthchecks por TCP).
# 3. Borramos herramientas de red interactivas (curl, wget, ping, telnet).
# 4. Creamos un grupo y usuario no-root ('appuser').
# 5. Limpiamos las listas de apt para reducir el tamaño final de la imagen.
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata bash && \
    apt-get purge -y curl wget iputils-ping telnet && \
    apt-get autoremove -y && \
    addgroup --system --gid 1000 appuser && \
    adduser --system --uid 1000 --ingroup appuser --no-create-home appuser && \
    rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los binarios compilados desde la etapa de compilación.
COPY --from=build /app/publish .

# Exponemos el puerto de la aplicación (5000)
EXPOSE 5000

# Cambiamos al usuario no-root creado para aplicar el principio de mínimo privilegio.
USER appuser

# Configuramos la URL para que Kestrel escuche en el puerto definido
ENV ASPNETCORE_URLS=http://+:5000

# Comando de inicio
ENTRYPOINT ["dotnet", "PermisosPuestosApi.dll"]
