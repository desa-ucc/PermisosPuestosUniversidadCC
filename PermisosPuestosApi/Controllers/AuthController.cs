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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email)) return Ok(new { message = "Si el correo está registrado, hemos enviado las instrucciones." });

            var pEmailValidar = new SqlParameter("@Email", request.Email);
            var emailExistsQuery = await _context.Database.SqlQueryRaw<int>("SELECT COUNT(1) AS Value FROM pt_Usuarios WHERE Email = @Email", pEmailValidar).ToListAsync();

            if (emailExistsQuery.FirstOrDefault() == 0)
            {
                 // Si no existe, simulamos éxito para evitar enumeración.
                 return Ok(new { message = "Si el correo está registrado, hemos enviado las instrucciones." });
            }

            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(tokenBytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
            var expiration = DateTime.UtcNow.AddMinutes(15);

            var pEmail = new SqlParameter("@Email", request.Email);
            var pToken = new SqlParameter("@Token", token);
            var pExpiration = new SqlParameter("@Expiration", expiration);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerarTokenRecuperacion @Email, @Token, @Expiration",
                pEmail, pToken, pExpiration
            );

            try {
                await EnviarCorreoRecuperacionAsync(request.Email, token);
            } catch (Exception ex) {
                // Registrar log del error en producción
                Console.WriteLine(ex.Message);
            }

            return Ok(new { message = "Si el correo está registrado, hemos enviado las instrucciones." });
        }

        private async Task EnviarCorreoRecuperacionAsync(string email, string token)
        {
            var host = _configuration["SMTP_HOST"];
            var portStr = _configuration["SMTP_PORT"];
            var user = _configuration["SMTP_USER"];
            var pass = _configuration["SMTP_PASS"];

            if(string.IsNullOrEmpty(host)) return; // Si no hay SMTP configurado, sale silente

            int port = int.TryParse(portStr, out var p) ? p : 587;
            var frontUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:4200";

            var resetLink = $"{frontUrl}/reset-password?token={token}";

            var message = new MimeKit.MimeMessage();
            message.From.Add(new MimeKit.MailboxAddress("Soporte Tecnológico UCC", user));
            message.To.Add(new MimeKit.MailboxAddress("", email));
            message.Subject = "Restablecimiento de Contraseña - Perfiles Tecnológicos";

            var bodyBuilder = new MimeKit.BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Recuperación de Contraseña</h2>
                    <p>Usted ha solicitado restablecer su contraseña.</p>
                    <p>Por favor haga clic en el siguiente enlace para continuar:</p>
                    <a href='{resetLink}'>Restablecer Contraseña</a>
                    <br><br>
                    <p>Este enlace es válido por 15 minutos.</p>
                    <p>Si no ha solicitado esto, puede ignorar el mensaje de forma segura.</p>
                "
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new MailKit.Net.Smtp.SmtpClient();
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(user, pass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
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

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
