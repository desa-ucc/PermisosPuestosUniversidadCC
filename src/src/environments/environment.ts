export const environment = {
  production: true,
  apiUrl: (window as any).__env?.API_URL || 'http://localhost:5000/api',
  msalConfig: {
    clientId: (window as any).__env?.MSAL_CLIENT_ID || 'TU_CLIENT_ID_AQUI',
    authority: (window as any).__env?.MSAL_AUTHORITY || 'https://login.microsoftonline.com/TU_TENANT_ID_AQUI',
    redirectUri: window.location.origin
  }
};
