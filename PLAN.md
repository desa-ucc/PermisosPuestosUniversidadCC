# PLAN: Implement Self-Service Password Reset (SPA)

## Architecture & Goals
- We are replacing the SMTP email approach with a Single Page Application (SPA) self-service flow.
- **Frontend (`forgot-password.component.ts`)**:
  - Update the first form to ask for 'Correo Electrónico' and 'Número de Cédula' (ID).
  - When submitted, send both to the backend.
  - If successful, the backend returns a token. Store this token.
  - Hide the first form using `*ngIf`.
  - Show a second form for 'Nueva Contraseña' and 'Confirmar Contraseña'.
  - On submit of the second form, call the reset password endpoint with the token and new password.
- **Backend (`AuthController.cs`)**:
  - Update `ForgotPasswordRequest` to include `Cedula` (or `Id`).
  - Update the `ForgotPassword` endpoint to validate both `Email` and `Cedula`. If they match a user in `pt_Usuarios`, generate a token, save it (via existing SP `sp_GenerarTokenRecuperacion`), and return it in the `200 OK` response.
  - Ensure the `ResetPassword` endpoint encrypts the new password (via the existing SP `sp_RestablecerPassword` which handles the logic, but wait, the instructions say "encripte la contraseña en la base de datos". I need to check if `sp_RestablecerPassword` already does this, or if the backend should hash it first. Let's look at the current `ResetPassword` - it takes `NewPassword` and passes it to the SP as `@NewPasswordHash`. The prompt says "encripte la contraseña en la base de datos", so the backend probably should hash it or the SP does. I will hash it in the backend just like `Login` might, or check if the SP expects plain text or hash. Let's look at `Memory`: "When hashing and storing passwords in SQL Server stored procedures (e.g., `sp_GestionarUsuarios`) into `NVARCHAR` columns, strictly use `LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @PasswordHash), 2))` to generate a hexadecimal string." This implies the hashing happens IN the database, or the C# backend hashes it and the DB expects the hash. The existing `ResetPassword` does `var pNewPasswordHash = new SqlParameter("@NewPasswordHash", request.NewPassword);` which implies the backend wasn't hashing it. I will hash it in the backend first to be safe, or just pass it to the SP if the SP hashes it. Wait, the rule says "strictly use LOWER(CONVERT(...)) to generate a hex string" IN the stored procedure. So the backend passes the PLAIN text, and the SP hashes it. I'll leave the SP call as is, but maybe rename the parameter to `@PasswordHash` or `@NewPassword`. Actually, I will follow the instructions: "reciba la nueva clave y el token, encripte la contraseña en la base de datos". This confirms the DB does the encryption. I'll pass the plain text to the SP as `@NuevaPassword`. Wait, the existing code uses `@NewPasswordHash`. Let's just hash it in the backend or let the DB do it. Let's look at how the DB hashes it. The memory says "strictly match the C# backend's lowercase hex SHA-256 format (`ToString("x2")`)". Let's hash it in the backend just like before, or let the SP do it. I'll pass it to the SP. Let's hash it in C# to be safe, since the SP parameter is `@NewPasswordHash`. Actually, the instructions say "encripte la contraseña en la base de datos", which implies the SP should do it. I don't have the SP code. I will assume the SP expects the plain password and hashes it, OR it expects the hash. I will just pass `request.NewPassword` and let the SP handle it, or hash it in C# if I want to be 100% sure it's hashed. Let's look at `AuthController.cs` `Login`: it passes `request.Password` directly to `sp_Login`. This means the SP `sp_Login` expects plain text and hashes it. So `sp_RestablecerPassword` probably expects plain text too.

## Steps
1. Modify `src/src/app/components/forgot-password/forgot-password.component.ts`.
2. Modify `PermisosPuestosApi/Controllers/AuthController.cs`.
3. Provide the modified files to the user.
