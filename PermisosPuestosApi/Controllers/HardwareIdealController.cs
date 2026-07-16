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
                .FromSqlRaw("EXEC sp_GestionarHardwareIdeal @Accion='SELECT'")
                .ToListAsync();
            return Ok(data);
        }

       [HttpPost]
        public async Task<IActionResult> CreateHardwareIdeal([FromBody] HardwareIdeal h)
        {
            try 
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarHardwareIdeal @Accion='INSERT', @PuestoId={0}, @TipoHardwareId={1}, @TipoEquipo={2}, @Procesador={3}, @Memoria={4}, @Disco={5}, @MarcaPC={6}, @OtrasConsideraciones={7}", 
                    h.PuestoId, 
                    (object)h.TipoHardwareId ?? DBNull.Value, 
                    string.IsNullOrEmpty(h.TipoEquipo) ? DBNull.Value : (object)h.TipoEquipo, // Agregado
                    string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador, 
                    string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria, 
                    string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco, 
                    string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC, 
                    (object)h.OtrasConsideraciones ?? DBNull.Value
                );
                
                return Ok();
            } 
            catch (Exception ex) 
            {
                Console.WriteLine($"Error SQL al crear Equipo Ideal: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHardwareIdeal(int id, [FromBody] HardwareIdeal h)
        {
            if (id != h.Id) return BadRequest();

            // Creamos parámetros explícitos para que SQL entienda el tipo de dato
            var pId = new SqlParameter("@Id", id);
            var pPuesto = new SqlParameter("@PuestoId", h.PuestoId);
            var pTipoHw = new SqlParameter("@TipoHardwareId", (object)h.TipoHardwareId ?? DBNull.Value);
            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? DBNull.Value : (object)h.TipoEquipo);
            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador);
            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria);
            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco);
            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC);
            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? DBNull.Value : (object)h.OtrasConsideraciones);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarHardwareIdeal @Accion='UPDATE', @Id=@Id, @PuestoId=@PuestoId, @TipoHardwareId=@TipoHardwareId, @TipoEquipo=@TipoEquipo, @Procesador=@Procesador, @Memoria=@Memoria, @Disco=@Disco, @MarcaPC=@MarcaPC, @OtrasConsideraciones=@OtrasConsideraciones",
                pId, pPuesto, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras
            );

            return NoContent();
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