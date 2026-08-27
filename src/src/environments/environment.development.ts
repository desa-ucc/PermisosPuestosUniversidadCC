export const environment = {
  production: false,
  // Para desarrollo local se puede mantener hardcodeado o simular el window.__env
  apiUrl: (window as any).__env?.apiUrl || 'http://localhost:5000/api',
  msalConfig: {
    clientId: (window as any).__env?.msalClientId || 'TU_CLIENT_ID_AQUI',
    authority: (window as any).__env?.msalAuthority || 'https://login.microsoftonline.com/TU_TENANT_ID_AQUI',
    redirectUri: (window as any).__env?.msalRedirectUri || 'http://localhost:4200/'
  }
};
