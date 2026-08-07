# Plan for Login and Authentication Features

## Requirements
1. Implement Microsoft SSO via `@azure/msal-angular` on the frontend.
2. Validate the Microsoft JWT in the backend (`.NET 8`) against a Tenant and issue an internal system JWT to keep using the existing RBAC logic.
3. Implement Password Recovery (Forgot Password & Reset Password) using secure tokens.
4. Simulate email sending for recovery token.
5. Add the `/reset-password` route in Angular.

## Proposed Steps

1. **Database Updates (`patch_auth.sql`)**
   - Add `ResetToken` (NVARCHAR(256)) and `ResetTokenExpires` (DATETIME) to `pt_Usuarios`.
   - Create Stored Procedures: `sp_SetResetToken` and `sp_ResetPasswordWithToken`.
   - Update C# models (`UsuarioDto`, `LoginRequest`) and add DTOs for `ForgotPasswordRequest`, `ResetPasswordRequest`, `MsalLoginRequest`.

2. **Backend Auth Updates (`AuthController.cs` & `Program.cs`)**
   - Add MSAL JWT validation configuration in `.NET 8`.
   - Implement `POST /api/auth/msal-login` endpoint: Validates MSAL token, finds user by email, and issues our internal JWT.
   - Implement `POST /api/auth/forgot-password` endpoint: Calls `sp_SetResetToken` and simulates email.
   - Implement `POST /api/auth/reset-password` endpoint: Calls `sp_ResetPasswordWithToken` to hash new password and clear token.

3. **Frontend MSAL Setup**
   - Install `@azure/msal-browser` and `@azure/msal-angular`.
   - Configure `MsalModule` in `app.config.ts`.
   - Update `LoginComponent` to use `MsalService.loginPopup()`, then send the ID token to our new `/api/auth/msal-login` endpoint.

4. **Frontend Reset Password Component**
   - Generate `ResetPasswordComponent`.
   - Add routing for `/reset-password`.
   - Implement the token extraction from URL and form for new password.
   - Update `LoginComponent` `recoverPassword()` to open a modal or prompt for the email to call `/api/auth/forgot-password`.

5. **Build and Test Verification**
   - Run backend build `dotnet build`.
   - Run frontend build `npx ng build`.
   - Run frontend tests.

6. **Pre-commit Steps**
   - Complete required verification and reflections.

7. **Submit Changes**
