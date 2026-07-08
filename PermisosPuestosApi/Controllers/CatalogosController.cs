using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CatalogosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CatalogosController(AppDbContext context) { _context = context; }

        // --- Ambientes ---
        [HttpGet("Ambientes")]
        public async Task<IActionResult> GetAmbientes() => Ok(_context.Cat_Ambientes.FromSqlRaw("EXEC sp_GetCatAmbientes").AsEnumerable().ToList());

        [HttpPost("Ambientes")]
        public async Task<IActionResult> CreateAmbiente([FromBody] Cat_Ambiente cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatAmbiente @Nombre", p);
            return Ok();
        }

        [HttpDelete("Ambientes/{id}")]
        public async Task<IActionResult> DeleteAmbiente(int id)
        {
            var p = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteCatAmbiente @Id", p);
            return NoContent();
        }

        // --- Sitios ---
        [HttpGet("Sitios")]
        public async Task<IActionResult> GetSitios() => Ok(_context.Cat_Sitios.FromSqlRaw("EXEC sp_GetCatSitios").AsEnumerable().ToList());

        [HttpPost("Sitios")]
        public async Task<IActionResult> CreateSitio([FromBody] Cat_Sitio cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatSitio @Nombre", p);
            return Ok();
        }

        [HttpDelete("Sitios/{id}")]
        public async Task<IActionResult> DeleteSitio(int id)
        {
            var p = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteCatSitio @Id", p);
            return NoContent();
        }

        // --- Plataformas ---
        [HttpGet("Plataformas")]
        public async Task<IActionResult> GetPlataformas() => Ok(_context.Cat_Plataformas.FromSqlRaw("EXEC sp_GetCatPlataformas").AsEnumerable().ToList());

        [HttpPost("Plataformas")]
        public async Task<IActionResult> CreatePlataforma([FromBody] Cat_Plataforma cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatPlataforma @Nombre", p);
            return Ok();
        }

        [HttpDelete("Plataformas/{id}")]
        public async Task<IActionResult> DeletePlataforma(int id)
        {
            var p = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteCatPlataforma @Id", p);
            return NoContent();
        }

        // --- Nuevos Catálogos (Read-Only) ---
        [HttpGet("NivelesAcceso")]
        public async Task<IActionResult> GetNivelesAcceso() => Ok(_context.Cat_NivelesAccesos.FromSqlRaw("EXEC sp_GetNivelesAcceso").AsEnumerable().ToList());

        [HttpGet("PlataformasNombres")]
        public async Task<IActionResult> GetPlataformasNombres() => Ok(_context.Cat_PlataformasNombres.FromSqlRaw("EXEC sp_GetPlataformasNombres").AsEnumerable().ToList());

        [HttpGet("TiposLicencia")]
        public async Task<IActionResult> GetTiposLicencia() => Ok(_context.Cat_TiposLicencias.FromSqlRaw("EXEC sp_GetTiposLicencia").AsEnumerable().ToList());
    }
}
