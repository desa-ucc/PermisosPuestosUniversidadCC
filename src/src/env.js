// Archivo de fallback para desarrollo local
(function (window) {
    window.__env = window.__env || {};
    window.__env.apiUrl = 'http://localhost:5000/api';
    window.__env.msalClientId = 'LOCAL_CLIENT_ID';
    window.__env.msalAuthority = 'https://login.microsoftonline.com/LOCAL_TENANT_ID';
    window.__env.msalRedirectUri = 'http://localhost:4200/';
}(this));
