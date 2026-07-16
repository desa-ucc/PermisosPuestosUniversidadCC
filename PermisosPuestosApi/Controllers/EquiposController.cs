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
    public class EquiposController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EquiposController(AppDbContext context) { _context = context; }

        [HttpGet("Asignado")]
        public async Task<IActionResult> GetHardwareAsignado()
        {
            // Usamos la Acción SELECT del SP unificado
            var data = await _context.HardwareAsignados
                .FromSqlRaw("EXEC sp_GestionarHardwareAsignado @Accion='SELECT'")
                .ToListAsync();
            return Ok(data);
        }

        [HttpPost("Asignado")]
        public async Task<IActionResult> CreateHardwareAsignado([FromBody] HardwareAsignado h)
        {
            try 
            {
                var pEmpleado = new SqlParameter("@EmpleadoId", h.EmpleadoId);
                var pTipoHw = new SqlParameter("@TipoHardwareId", (object)h.TipoHardwareId ?? DBNull.Value);
                var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? DBNull.Value : (object)h.TipoEquipo);
                var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador);
                var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria);
                var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco);
                var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC);
                var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? DBNull.Value : (object)h.OtrasConsideraciones);
                var pPlaca = new SqlParameter("@Placa", string.IsNullOrEmpty(h.Placa) ? DBNull.Value : (object)h.Placa);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarHardwareAsignado @Accion='INSERT', @EmpleadoId=@EmpleadoId, @TipoHardwareId=@TipoHardwareId, @TipoEquipo=@TipoEquipo, @Procesador=@Procesador, @Memoria=@Memoria, @Disco=@Disco, @MarcaPC=@MarcaPC, @OtrasConsideraciones=@OtrasConsideraciones, @Placa=@Placa",
                    pEmpleado, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras, pPlaca
                );
                
                return Ok();
            } 
            catch (Exception ex) 
            {
                return StatusCode(500, $"Error al crear: {ex.Message}");
            }
        }

        [HttpPut("Asignado/{id}")]
        public async Task<IActionResult> UpdateHardwareAsignado(int id, [FromBody] HardwareAsignado h)
        {
            if (id != h.Id) return BadRequest();

            var pId = new SqlParameter("@Id", id);
            var pEmpleado = new SqlParameter("@EmpleadoId", h.EmpleadoId);
            var pTipoHw = new SqlParameter("@TipoHardwareId", (object)h.TipoHardwareId ?? DBNull.Value);
            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? DBNull.Value : (object)h.TipoEquipo);
            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? DBNull.Value : (object)h.Procesador);
            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? DBNull.Value : (object)h.Memoria);
            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? DBNull.Value : (object)h.Disco);
            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? DBNull.Value : (object)h.MarcaPC);
            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? DBNull.Value : (object)h.OtrasConsideraciones);
            var pPlaca = new SqlParameter("@Placa", string.IsNullOrEmpty(h.Placa) ? DBNull.Value : (object)h.Placa);

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarHardwareAsignado @Accion='UPDATE', @Id=@Id, @EmpleadoId=@EmpleadoId, @TipoHardwareId=@TipoHardwareId, @TipoEquipo=@TipoEquipo, @Procesador=@Procesador, @Memoria=@Memoria, @Disco=@Disco, @MarcaPC=@MarcaPC, @OtrasConsideraciones=@OtrasConsideraciones, @Placa=@Placa",
                pId, pEmpleado, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras, pPlaca
            );
            
            return NoContent();
        }

        [HttpDelete("Asignado/{id}")]
        public async Task<IActionResult> DeleteHardwareAsignado(int id)
        {
            var pId = new SqlParameter("@Id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_GestionarHardwareAsignado @Accion='DELETE', @Id=@Id", pId);
            return NoContent();
        }
    }
}