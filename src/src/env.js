// Archivo de fallback para desarrollo local
(function (window) {
    window.__env = window.__env || {};
    window.__env.apiUrl = 'http://localhost:5000/api';
    window.__env.msalClientId = '960a0cef-4372-4565-9bb4-88b423223765';
    window.__env.msalAuthority = 'https://login.microsoftonline.com/LOCAL_TENANT_ID';
    window.__env.msalRedirectUri = 'http://localhost:4200/login';
}(this));
