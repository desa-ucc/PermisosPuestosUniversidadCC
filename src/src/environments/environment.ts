export const environment = {
  production: true,
  // Utilizamos inyección de variables dinámicas en tiempo de ejecución
  // proporcionadas por env.js a través de window.__env.
  // Si no existen, se proporciona un fallback razonable o vacío.
  apiUrl: (window as any).__env?.apiUrl || 'http://localhost:5000/api',
  msalConfig: {
    clientId: (window as any).__env?.msalClientId || 'TU_CLIENT_ID_AQUI',
    authority: (window as any).__env?.msalAuthority || 'https://login.microsoftonline.com/TU_TENANT_ID_AQUI',
    redirectUri: (window as any).__env?.msalRedirectUri || 'http://localhost:4200/'
  }
};
