using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PermisosPuestosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usernameParam = new SqlParameter("@NombreUsuario", request.Username);
            var passwordParam = new SqlParameter("@Password", request.Password);

            var usuarios = await _context.UsuariosDto
                .FromSqlRaw("EXEC sp_Login @NombreUsuario, @Password", usernameParam, passwordParam)
                .ToListAsync();

            var user = usuarios.FirstOrDefault();

            if (user == null)
            {
                return Unauthorized(new { message = "Credenciales incorrectas" });
            }

            var token = GenerateJwtToken(user);

            var roleIdParam = new SqlParameter("@RoleId", user.RolId);
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(new
            {
                token = token,
                username = user.NombreUsuario,
                role = user.NombreRol,
                permisos = permisos
            });
        }


        [HttpPost("entra-login")]
        public async Task<IActionResult> EntraLogin([FromBody] EntraLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest(new { message = "El correo es requerido." });

            var emailParam = new SqlParameter("@Email", request.Email);

            // We need to fetch the user matching the Email. We can't use sp_Login because that requires a password.
            // We must use a direct query or a new SP. The instruction says:
            // "Buscará el Email en dbo.pt_Usuarios. Rechazo: Si el correo no existe o Activo es false, devuelve un 401... Éxito: Si existe y está activo, reutiliza la misma lógica del login normal..."

            // Note: EF Core from SqlQueryRaw requires mapping to a model. We have UsuarioDto, but it needs NombreRol.
            // Let's do a JOIN with pt_Roles to get the same data as sp_Login.
            var query = @"
                SELECT
                    u.Id,
                    u.NombreUsuario,
                    u.PasswordHash,
                    u.RolId,
                    r.Nombre AS NombreRol
                FROM pt_Usuarios u
                INNER JOIN pt_Roles r ON u.RolId = r.Id
                WHERE u.Email = @Email AND u.Activo = 1";

            var usuarios = await _context.UsuariosDto
                .FromSqlRaw(query, emailParam)
                .ToListAsync();

            var user = usuarios.FirstOrDefault();

            if (user == null)
            {
                return Unauthorized(new { message = "Usuario no registrado en la base de datos o inactivo" });
            }

            var token = GenerateJwtToken(user);

            var roleIdParam = new SqlParameter("@RoleId", user.RolId);
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(new
            {
                token = token,
                username = user.NombreUsuario,
                role = user.NombreRol,
                permisos = permisos
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.NombreUsuario))
                return BadRequest(new { message = "El correo y el nombre de usuario son requeridos." });

            var pEmailValidar = new SqlParameter("@Email", request.Email);
            var pUsuarioValidar = new SqlParameter("@NombreUsuario", request.NombreUsuario);

            var userExistsQuery = await _context.Database.SqlQueryRaw<int>(
                "SELECT COUNT(1) AS Value FROM pt_Usuarios WHERE Email = @Email AND NombreUsuario = @NombreUsuario AND Activo = 1",
                pEmailValidar, pUsuarioValidar).ToListAsync();

            if (userExistsQuery.FirstOrDefault() == 0)
            {
                 return BadRequest(new { message = "Los datos proporcionados no coinciden con ningún usuario registrado." });
            }

            var token = Guid.NewGuid().ToString();
            var expiration = DateTime.UtcNow.AddHours(1);

            var updateEmailParam = new SqlParameter("@UpdateEmail", request.Email);
            var updateTokenParam = new SqlParameter("@Token", token);
            var updateExpParam = new SqlParameter("@ExpiracionToken", expiration);

            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE pt_Usuarios SET TokenRecuperacion = @Token, ExpiracionToken = @ExpiracionToken WHERE Email = @UpdateEmail",
                updateTokenParam, updateExpParam, updateEmailParam
            );

            return Ok(new { success = true, token = token });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var pToken = new SqlParameter("@Token", request.Token);
            var pNewPasswordHash = new SqlParameter("@NewPasswordHash", request.NewPassword);

            var resultParam = new SqlParameter
            {
                ParameterName = "@EsValido",
                SqlDbType = System.Data.SqlDbType.Int,
                Direction = System.Data.ParameterDirection.Output
            };

            // Ejecutamos el SP
            var spSql = "EXEC sp_RestablecerPassword @Token, @NewPasswordHash";
            var resultQuery = await _context.Database.SqlQueryRaw<int>(spSql, pToken, pNewPasswordHash).ToListAsync();

            var isValid = resultQuery.FirstOrDefault() == 1;

            if (isValid)
            {
                return Ok(new { message = "Contraseña restablecida con éxito." });
            }

            return BadRequest(new { message = "El token es inválido o ha expirado." });
        }

        private string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        private string GenerateJwtToken(UsuarioDto user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? "FallbackSuperSecretKeyForJWTAuthProyectoPermisosXPuesto2024+";
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.NombreUsuario),
                    new Claim(ClaimTypes.Role, user.NombreRol),
                    new Claim("RolId", user.RolId.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }


    public class EntraLoginRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
