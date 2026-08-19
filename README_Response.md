# Respuesta para el Administrador del Tenant

Hola. Para configurar correctamente el 'App Registration' en Microsoft Entra ID y permitir el inicio de sesión único (SSO) en nuestra aplicación, por favor asegúrate de cumplir con los siguientes puntos:

### 1. Permisos de API (API Permissions) en Microsoft Entra ID
Necesitamos agregar los siguientes permisos delegados (Delegated Permissions) de **Microsoft Graph**:

- `openid`: Permite a la aplicación usar OpenID Connect para autenticar al usuario.
- `profile`: Permite leer el perfil básico del usuario (nombre, apellido, etc.).
- `email`: Permite leer la dirección de correo electrónico del usuario. **(Crítico para nuestro mapeo)**.
- `User.Read`: Permite iniciar sesión y leer el perfil del usuario autenticado.

**Importante sobre el Consentimiento del Administrador (Admin Consent):**
Aunque la mayoría de estos permisos básicos (como `email` y `profile`) pueden ser consentidos por el usuario final, es altamente recomendable (y en algunas organizaciones estrictas, obligatorio) otorgar el **"Admin Consent" a nivel de tenant** para todos los usuarios. Esto evitará que a cada colaborador le aparezca una pantalla de autorización la primera vez que intente ingresar.

### 2. Flujo de Autenticación y Mapeo Interno (.NET)

La arquitectura de validación y autorización se manejará de la siguiente manera:

1. **Frontend (Angular)**: Utiliza la librería `@azure/msal-angular` para mostrar el popup de Microsoft. Solo expone configuraciones públicas (`clientId` y `tenantId`). Una vez que el usuario se loguea exitosamente en Microsoft, MSAL nos devuelve un `IdToken` firmado.
2. **Backend (.NET 8)**: Hemos creado un endpoint específico (`POST /api/auth/msal-login`) que recibe este `IdToken`.
   - **Validación**: El backend verifica criptográficamente el token contra las llaves públicas de Microsoft (usando `OpenIdConnectConfigurationRetriever`), asegurando que fue emitido por nuestro Tenant y para nuestro Client ID.
   - **Mapeo**: Una vez validado, el backend extrae el claim `email` o `preferred_username` del token de Microsoft.
   - **Autorización Interna**: Con ese correo, ejecutamos nuestro Stored Procedure `sp_GetUsuarioPorEmail` en la tabla `pt_Usuarios`. Si el usuario existe y está activo, el backend desecha el token de Microsoft y **genera y devuelve nuestro propio JWT interno**.
3. **RBAC**: Ese JWT interno contiene exactamente el mismo `RolId` y permisos que si el usuario hubiera ingresado con contraseña manual. De esta forma, los menús, las opciones y la seguridad dentro del sistema siguen funcionando idénticamente.
