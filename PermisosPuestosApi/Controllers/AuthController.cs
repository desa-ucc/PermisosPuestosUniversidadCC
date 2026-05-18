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

            var usuarios = await _context.UsuariosDto
                .FromSqlRaw("EXEC sp_Login @NombreUsuario", usernameParam)
                .ToListAsync();

            var user = usuarios.FirstOrDefault();

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
                    new Claim(ClaimTypes.Role, user.NombreRol)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
