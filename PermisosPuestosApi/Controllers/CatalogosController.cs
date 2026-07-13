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
        public async Task<IActionResult> GetAmbientes() => Ok(await _context.Cat_Ambientes.FromSqlRaw("EXEC sp_GetCatAmbientes").ToListAsync());

        [HttpGet("Ambientes/{id}")]
        public async Task<IActionResult> GetAmbiente(int id)
        {
            var p = new SqlParameter("@Id", id);
            var res = await _context.Cat_Ambientes.FromSqlRaw("EXEC sp_GetCatAmbientePorId @Id", p).ToListAsync();
            var item = res.FirstOrDefault();
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("Ambientes")]
        public async Task<IActionResult> CreateAmbiente([FromBody] Cat_Ambiente cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatAmbiente @Nombre", p);
            return Ok();
        }

        [HttpPut("Ambientes/{id}")]
        public async Task<IActionResult> UpdateAmbiente(int id, [FromBody] Cat_Ambiente cat)
        {
            var p1 = new SqlParameter("@Id", id);
            var p2 = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateCatAmbiente @Id, @Nombre", p1, p2);
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
        public async Task<IActionResult> GetSitios() => Ok(await _context.Cat_Sitios.FromSqlRaw("EXEC sp_GetCatSitios").ToListAsync());

        [HttpGet("Sitios/{id}")]
        public async Task<IActionResult> GetSitio(int id)
        {
            var p = new SqlParameter("@Id", id);
            var res = await _context.Cat_Sitios.FromSqlRaw("EXEC sp_GetCatSitioPorId @Id", p).ToListAsync();
            var item = res.FirstOrDefault();
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("Sitios")]
        public async Task<IActionResult> CreateSitio([FromBody] Cat_Sitio cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatSitio @Nombre", p);
            return Ok();
        }

        [HttpPut("Sitios/{id}")]
        public async Task<IActionResult> UpdateSitio(int id, [FromBody] Cat_Sitio cat)
        {
            var p1 = new SqlParameter("@Id", id);
            var p2 = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateCatSitio @Id, @Nombre", p1, p2);
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
        public async Task<IActionResult> GetPlataformas() => Ok(await _context.Cat_Plataformas.FromSqlRaw("EXEC sp_GetCatPlataformas").ToListAsync());

        [HttpGet("Plataformas/{id}")]
        public async Task<IActionResult> GetPlataforma(int id)
        {
            var p = new SqlParameter("@Id", id);
            var res = await _context.Cat_Plataformas.FromSqlRaw("EXEC sp_GetCatPlataformaPorId @Id", p).ToListAsync();
            var item = res.FirstOrDefault();
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("Plataformas")]
        public async Task<IActionResult> CreatePlataforma([FromBody] Cat_Plataforma cat)
        {
            var p = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_CreateCatPlataforma @Nombre", p);
            return Ok();
        }

        [HttpPut("Plataformas/{id}")]
        public async Task<IActionResult> UpdatePlataforma(int id, [FromBody] Cat_Plataforma cat)
        {
            var p1 = new SqlParameter("@Id", id);
            var p2 = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_UpdateCatPlataforma @Id, @Nombre", p1, p2);
            return Ok();
        }

        [HttpDelete("Plataformas/{id}")]
        public async Task<IActionResult> DeletePlataforma(int id)
        {
            var p = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteCatPlataforma @Id", p);
            return NoContent();
        }


        // --- Tipos de Hardware ---
        [HttpGet("TiposHardware")]
        public async Task<IActionResult> GetTiposHardware()
        {
            var p = new SqlParameter("@Accion", "SELECT");
            return Ok(await _context.Cat_TiposHardware.FromSqlRaw("EXEC sp_GestionarTiposHardware @Accion", p).ToListAsync());
        }

        [HttpGet("TiposHardware/{id}")]
        public async Task<IActionResult> GetTipoHardware(int id)
        {
            var p1 = new SqlParameter("@Accion", "SELECT");
            var p2 = new SqlParameter("@Id", id);
            var res = await _context.Cat_TiposHardware.FromSqlRaw("EXEC sp_GestionarTiposHardware @Accion, @Id", p1, p2).ToListAsync();
            var item = res.FirstOrDefault();
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("TiposHardware")]
        public async Task<IActionResult> CreateTipoHardware([FromBody] Cat_TiposHardware cat)
        {
            var p1 = new SqlParameter("@Accion", "INSERT");
            var p2 = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_GestionarTiposHardware @Accion, NULL, @Nombre", p1, p2);
            return Ok();
        }

        [HttpPut("TiposHardware/{id}")]
        public async Task<IActionResult> UpdateTipoHardware(int id, [FromBody] Cat_TiposHardware cat)
        {
            var p1 = new SqlParameter("@Accion", "UPDATE");
            var p2 = new SqlParameter("@Id", id);
            var p3 = new SqlParameter("@Nombre", cat.Nombre);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_GestionarTiposHardware @Accion, @Id, @Nombre", p1, p2, p3);
            return Ok();
        }

        [HttpDelete("TiposHardware/{id}")]
        public async Task<IActionResult> DeleteTipoHardware(int id)
        {
            var p1 = new SqlParameter("@Accion", "DELETE");
            var p2 = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_GestionarTiposHardware @Accion, @Id", p1, p2);
            return NoContent();
        }

        // --- Nuevos Catálogos (Read-Only) ---
        [HttpGet("NivelesAcceso")]
        public async Task<IActionResult> GetNivelesAcceso() => Ok(await _context.Cat_NivelesAccesos.FromSqlRaw("EXEC sp_GetNivelesAcceso").ToListAsync());

        [HttpGet("PlataformasNombres")]
        public async Task<IActionResult> GetPlataformasNombres() => Ok(await _context.Cat_PlataformasNombres.FromSqlRaw("EXEC sp_GetPlataformasNombres").ToListAsync());

        [HttpGet("TiposLicencia")]
        public async Task<IActionResult> GetTiposLicencia() => Ok(await _context.Cat_TiposLicencias.FromSqlRaw("EXEC sp_GetTiposLicencia").ToListAsync());
    }
}
