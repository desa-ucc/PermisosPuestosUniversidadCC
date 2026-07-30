using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;
using System;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HardwareIdealController : ControllerBase
    {
        private readonly AppDbContext _context;
        public HardwareIdealController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetHardwareIdeal()
        {
            // Usamos la Acción SELECT
            var data = await _context.HardwareIdeales
                .FromSqlRaw("Select * from v_GestionarHardwareIdeal")
                .ToListAsync();
            return Ok(data);
        }

      [HttpPost]
    public async Task<IActionResult> CreateHardwareIdeal([FromBody] HardwareIdeal h)
    {
        try 
        {
            var pAccion = new SqlParameter("@Accion", "INSERT");
            var pId = new SqlParameter("@Id", DBNull.Value);
            var pPuesto = new SqlParameter("@PuestoId", h.PuestoId);
            var pTipoHw = new SqlParameter("@TipoHardwareId", h.TipoHardwareId != 0 ? (object)h.TipoHardwareId : DBNull.Value);
            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? (object)DBNull.Value : h.TipoEquipo);
            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? (object)DBNull.Value : h.Procesador);
            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? (object)DBNull.Value : h.Memoria);
            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? (object)DBNull.Value : h.Disco);
            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? (object)DBNull.Value : h.MarcaPC);
            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? (object)DBNull.Value : h.OtrasConsideraciones);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarHardwareIdeal @Accion, @Id, @PuestoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones",
                pAccion, pId, pPuesto, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras
            );
            
            return Ok();
        } 
        catch (Exception ex) 
        {
            return StatusCode(500, $"Error al crear: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHardwareIdeal(int id, [FromBody] HardwareIdeal h)
    {
        if (id != h.Id) return BadRequest();

        try
        {
            var pAccion = new SqlParameter("@Accion", "UPDATE");
            var pId = new SqlParameter("@Id", id);
            var pPuesto = new SqlParameter("@PuestoId", h.PuestoId);
            var pTipoHw = new SqlParameter("@TipoHardwareId", h.TipoHardwareId != 0 ? (object)h.TipoHardwareId : DBNull.Value);
            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? (object)DBNull.Value : h.TipoEquipo);
            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? (object)DBNull.Value : h.Procesador);
            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? (object)DBNull.Value : h.Memoria);
            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? (object)DBNull.Value : h.Disco);
            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? (object)DBNull.Value : h.MarcaPC);
            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? (object)DBNull.Value : h.OtrasConsideraciones);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarHardwareIdeal @Accion, @Id, @PuestoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones",
                pAccion, pId, pPuesto, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al actualizar: {ex.Message}");
        }
    }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHardwareIdeal(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarHardwareIdeal @Accion='DELETE', @Id={0}", id);
            return NoContent();
        }
    }
}