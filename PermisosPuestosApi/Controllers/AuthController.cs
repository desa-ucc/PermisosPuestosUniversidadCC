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
            // Pasamos el usuario y la contraseña (en texto plano) al SP
            var usernameParam = new SqlParameter("@NombreUsuario", request.Username);
            var passwordParam = new SqlParameter("@Password", request.Password);

            // Llamamos al nuevo sp_Login que valida todo internamente
            var usuarios = await _context.UsuariosDto
                .FromSqlRaw("EXEC sp_Login @NombreUsuario, @Password", usernameParam, passwordParam)
                .ToListAsync();

            var user = usuarios.FirstOrDefault();

            if (user == null)
            {
                // Si el usuario es null, es porque el usuario no existe, está inactivo O la contraseña es incorrecta
                return Unauthorized(new { message = "Credenciales incorrectas" });
            }

            // Si llegamos aquí, el usuario es válido
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


        [HttpPost("msal-login")]
        public async Task<IActionResult> MsalLogin([FromBody] MsalLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
                return BadRequest("El token es requerido.");

            var tokenHandler = new JwtSecurityTokenHandler();
            if (!tokenHandler.CanReadToken(request.IdToken))
                return BadRequest("Formato de token inválido.");

            JwtSecurityToken jwtToken;
            try
            {
                // En producción: Validar firma con llaves públicas de Microsoft.
                // Aquí extraemos directamente el correo para integrarnos con sp_ValidarUsuarioSSO
                jwtToken = tokenHandler.ReadJwtToken(request.IdToken);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al procesar el token: {ex.Message}");
            }

            var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "preferred_username" || c.Type == "email");
            if (emailClaim == null)
                return Unauthorized(new { message = "No se pudo obtener el correo del usuario desde el token de Microsoft." });

            string email = emailClaim.Value;

            // Integración estricta con el SP solicitado
            var emailParam = new SqlParameter("@Correo", email);
            var usuarios = await _context.UsuariosSsoDto
                .FromSqlRaw("EXEC sp_ValidarUsuarioSSO @Correo", emailParam)
                .ToListAsync();

            var user = usuarios.FirstOrDefault();

            if (user == null)
            {
                return Unauthorized(new { message = $"El usuario {email} no existe en el sistema interno o está inactivo." });
            }

            var internalToken = GenerateJwtTokenSso(user);

            var roleIdParam = new SqlParameter("@RoleId", user.RolId);
            var permisos = await _context.Set<PermisoDto>()
                .FromSqlRaw("EXEC sp_ObtenerPermisosPorRol @RoleId", roleIdParam)
                .ToListAsync();

            return Ok(new
            {
                token = internalToken,
                username = user.NombreUsuario,
                role = user.RolAcceso,
                permisos = permisos
            });
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
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
            {
                jwtKey = "FallbackSuperSecretKeyForJWTAuthProyectoPermisosXPuesto2024+";
            }
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

        private string GenerateJwtTokenSso(UsuarioSsoDto user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
            {
                jwtKey = "FallbackSuperSecretKeyForJWTAuthProyectoPermisosXPuesto2024+";
            }
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UsuarioId.ToString()),
                    new Claim(ClaimTypes.Name, user.NombreUsuario),
                    new Claim(ClaimTypes.Role, user.RolAcceso),
                    new Claim("RolId", user.RolId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
