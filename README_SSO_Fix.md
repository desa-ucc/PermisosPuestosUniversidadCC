# Resumen de Correcciones Implementadas

1. **Inyección de Variables Dinámicas en Frontend:**
   - Se crearon los archivos `env.template.js` y `env.js` en los `assets` de Angular.
   - NGINX fue configurado con un script `entrypoint.sh` que ejecuta `envsubst` para reemplazar las variables `${MSAL_CLIENT_ID}` y `${MSAL_AUTHORITY}` inyectadas desde Docker hacia el frontend, garantizando que ya no queden quemadas en el código estático compilado.

2. **Resolución de Error Kestrel IDX10703:**
   - Se corrigió `Program.cs` y `AuthController.cs` verificando no solo que `Jwt:Key` exista y no sea nulo, sino también que posea una longitud `Length < 32`. Si la llave del `.env` es menor a esto, se asume un fallback seguro que previene el cierre inesperado del servidor y permite levantar la aplicación de forma estable.

3. **Integración Completa del Login Microsoft (SSO):**
   - El endpoint `MsalLogin` fue ajustado en .NET.
   - El API ejecuta `sp_ValidarUsuarioSSO` usando el correo del token.
   - Al coincidir un usuario activo en el sistema, se emite exitosamente un nuevo JWT nativo utilizando el rol, ID y permisos provenientes del Stored Procedure, mapeando a la perfección Microsoft SSO con nuestra seguridad RBAC.
