using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System;
using System.Threading.Tasks;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SoftwareController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SoftwareController(AppDbContext context) { _context = context; }

        [HttpGet("Local")]
        public async Task<IActionResult> GetSoftwareLocales()
        {
            var data = await _context.Database.SqlQueryRaw<SoftwareLocal>(
                "EXEC sp_GestionarSoftwareLocal @Accion='SELECT'"
            ).ToListAsync();
            return Ok(data);
        }

        [HttpPost("Local")]
        public async Task<IActionResult> CreateSoftwareLocal([FromBody] SoftwareLocal s)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarSoftwareLocal @Accion='INSERT', @EmpleadoId=@e, @Equipo=@eq, @GruposAD=@g, @NombreSoftware=@n, @Version=@v, @Fabricante=@f",
                new SqlParameter("@e", s.EmpleadoId),
                new SqlParameter("@eq", s.Equipo ?? (object)DBNull.Value),
                new SqlParameter("@g", s.GruposAD ?? (object)DBNull.Value),
                new SqlParameter("@n", s.NombreSoftware ?? (object)DBNull.Value),
                new SqlParameter("@v", s.Version ?? (object)DBNull.Value),
                new SqlParameter("@f", s.Fabricante ?? (object)DBNull.Value)
            );
            return Ok();
        }

        [HttpPut("Local/{id}")]
        public async Task<IActionResult> UpdateSoftwareLocal(int id, [FromBody] SoftwareLocal s)
        {
            if (id != s.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarSoftwareLocal @Accion='UPDATE', @Id=@id, @EmpleadoId=@e, @Equipo=@eq, @GruposAD=@g, @NombreSoftware=@n, @Version=@v, @Fabricante=@f",
                new SqlParameter("@id", id),
                new SqlParameter("@e", s.EmpleadoId),
                new SqlParameter("@eq", s.Equipo ?? (object)DBNull.Value),
                new SqlParameter("@g", s.GruposAD ?? (object)DBNull.Value),
                new SqlParameter("@n", s.NombreSoftware ?? (object)DBNull.Value),
                new SqlParameter("@v", s.Version ?? (object)DBNull.Value),
                new SqlParameter("@f", s.Fabricante ?? (object)DBNull.Value)
            );
            return NoContent();
        }

        [HttpDelete("Local/{id}")]
        public async Task<IActionResult> DeleteSoftwareLocal(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarSoftwareLocal @Accion='DELETE', @Id=@id",
                new SqlParameter("@id", id)
            );
            return NoContent();
        }
    }
}
