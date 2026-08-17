export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api',
  msalConfig: {
    clientId: 'TU_CLIENT_ID_AQUI',
    authority: 'https://login.microsoftonline.com/TU_TENANT_ID_AQUI',
    redirectUri: 'http://localhost:4200/'
  }
};
