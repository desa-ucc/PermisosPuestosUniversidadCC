#!/bin/bash
# ==============================================================================
# SCRIPT DE INYECCIÓN DE VARIABLES DE ENTORNO EN TIEMPO DE EJECUCIÓN (RUNTIME)
# ==============================================================================
# Propósito: Este script se ejecuta antes de que inicie NGINX. Toma las variables
# de entorno del contenedor y las inyecta en un archivo env.js que el frontend
# de Angular leerá dinámicamente, evitando que las credenciales queden quemadas.

echo "Iniciando inyección de variables de entorno (Runtime)..."

# Creamos o sobreescribimos el archivo env.js en el directorio público de Nginx
cat <<EOT > /usr/share/nginx/html/env.js
// ==============================================================================
// CONFIGURACIÓN DE ENTORNO DINÁMICA
// Generado automáticamente por entrypoint.sh al iniciar el contenedor
// ==============================================================================
(function (window) {
    window.__env = window.__env || {};

    // URL de la API del Backend
    window.__env.apiUrl = '${API_URL}';

    // Variables de Autenticación (MSAL / Azure AD, etc.)
    window.__env.msalClientId = '${MSAL_CLIENT_ID}';
    window.__env.msalAuthority = '${MSAL_AUTHORITY}';
    window.__env.msalRedirectUri = '${MSAL_REDIRECT_URI}';

    // Otras variables necesarias pueden ser agregadas aquí
}(this));
EOT

echo "Inyección completada. Contenido de env.js:"
cat /usr/share/nginx/html/env.js
