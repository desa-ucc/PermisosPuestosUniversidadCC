FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PermisosPuestosApi.csproj", "./"]
RUN dotnet restore "./PermisosPuestosApi.csproj"
COPY . .
RUN dotnet build "PermisosPuestosApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PermisosPuestosApi.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "PermisosPuestosApi.dll"]
