const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'Controllers', 'AuthController.cs');
let content = fs.readFileSync(filePath, 'utf8');

const newLoginLogic = `
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Database.SqlQueryRaw<UsuarioDto>(
                    "EXEC sp_Login @NombreUsuario={0}", request.Username
                ).FirstOrDefaultAsync();

                if (user == null)
                {
                    return Unauthorized(new { message = "Usuario no encontrado o inactivo" });
                }

                var hashToVerify = ComputeSha256Hash(request.Password);

                if (!string.Equals(user.PasswordHash, hashToVerify, StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { message = "Contraseña incorrecta" });
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    token = token,
                    username = user.NombreUsuario,
                    role = user.NombreRol
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR EN LOGIN] {ex.Message}");
                return StatusCode(500, new { message = "Error interno durante la autenticación", error = ex.Message });
            }
        }
`;

content = content.replace(/\[HttpPost\("login"\)\][\s\S]*?return Ok\(new[\s\S]*?\}\);\n            \}\n            catch \(Exception ex\)[\s\S]*?return StatusCode\(500, new \{ message = "Error interno durante la autenticación", error = ex\.Message \}\);\n            \}\n        \}/, newLoginLogic.trim());
// if try-catch wasn't successfully saved before (since we did git reset), let's make sure we catch both variants:
content = content.replace(/\[HttpPost\("login"\)\][\s\S]*?return Ok\(new[\s\S]*?\}\);\n        \}/, newLoginLogic.trim());

fs.writeFileSync(filePath, content);
console.log("AuthController updated to use SqlQueryRaw");
