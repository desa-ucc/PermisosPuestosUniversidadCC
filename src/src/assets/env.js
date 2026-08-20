(function(window) {
  window.__env = window.__env || {};

  window.__env.MSAL_CLIENT_ID = 'local_client_id';
  window.__env.MSAL_AUTHORITY = 'https://login.microsoftonline.com/local_tenant_id';
  window.__env.API_URL = 'http://localhost:5000/api';
})(this);
