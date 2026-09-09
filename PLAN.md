# PLAN: Create sp_GenerarTokenRecuperacion SQL Script

## Architecture & Goals
- User needs a T-SQL script to alter `pt_Usuarios` (adding `PasswordResetToken` and `PasswordResetExpiration` if they don't exist) and create the stored procedure `sp_GenerarTokenRecuperacion`.
- The stored procedure should accept `@Email`, `@Token`, and `@Expiration` and update the table.
- I need to provide ONLY the SQL script in my final response, plus the mandatory audit score.

## Steps
1. Draft the SQL script correctly.
2. Provide it to the user.
