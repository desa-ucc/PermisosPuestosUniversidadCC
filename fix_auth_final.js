const fs = require('fs');
const path = require('path');

const filePath = path.join('PermisosPuestosApi', 'Controllers', 'AuthController.cs');
let content = fs.readFileSync(filePath, 'utf8');

const loginFix = `
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Ejecución del SP con mapeo directo
                var usuarios = await _context.Database.SqlQueryRaw<UsuarioDto>(
                    "EXEC sp_Login {0}", request.Username
                ).ToListAsync();

                var user = usuarios.FirstOrDefault();

                if (user == null)
                {
                    return Unauthorized(new { message = "Credenciales incorrectas" });
                }

                var hashToVerify = ComputeSha256Hash(request.Password);

                if (!string.Equals(user.PasswordHash, hashToVerify, StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { message = "Credenciales incorrectas" });
                }

                // Generación del token
                var token = GenerateJwtToken(user);

                Console.WriteLine("Login exitoso, token generado para: " + user.NombreUsuario);

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

content = content.replace(/\[HttpPost\("login"\)\][\s\S]*?return StatusCode\(500, new \{ message = "Error interno durante la autenticación", error = ex\.Message \}\);\n            \}\n        \}/, loginFix.trim());

fs.writeFileSync(filePath, content);
console.log("Auth controller updated successfully.");
