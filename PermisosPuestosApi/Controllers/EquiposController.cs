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
            var data = await _context.HardwareAsignados
                .FromSqlRaw("select * from v_GestionarHardwareAsignado")
                .ToListAsync();
            return Ok(data);
        }

      [HttpPost("Asignado")]
        public async Task<IActionResult> CreateHardwareAsignado([FromBody] HardwareAsignado h)
        {
            try 
            {
                var pAccion = new SqlParameter("@Accion", "INSERT");
                var pId = new SqlParameter("@Id", DBNull.Value);
                var pEmpleado = new SqlParameter("@EmpleadoId", h.EmpleadoId);
                var pTipoHw = new SqlParameter("@TipoHardwareId", h.TipoHardwareId != 0 ? (object)h.TipoHardwareId : DBNull.Value);
                var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? (object)DBNull.Value : h.TipoEquipo);
                var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? (object)DBNull.Value : h.Procesador);
                var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? (object)DBNull.Value : h.Memoria);
                var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? (object)DBNull.Value : h.Disco);
                var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? (object)DBNull.Value : h.MarcaPC);
                var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? (object)DBNull.Value : h.OtrasConsideraciones);
                var pPlaca = new SqlParameter("@Placa", string.IsNullOrEmpty(h.Placa) ? (object)DBNull.Value : h.Placa);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarHardwareAsignado @Accion, @Id, @EmpleadoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones, @Placa",
                    pAccion, pId, pEmpleado, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras, pPlaca
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

            try
            {
                var pAccion = new SqlParameter("@Accion", "UPDATE");
                var pId = new SqlParameter("@Id", id);
                var pEmpleado = new SqlParameter("@EmpleadoId", h.EmpleadoId);
                var pTipoHw = new SqlParameter("@TipoHardwareId", h.TipoHardwareId != 0 ? (object)h.TipoHardwareId : DBNull.Value);
                var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(h.TipoEquipo) ? (object)DBNull.Value : h.TipoEquipo);
                var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(h.Procesador) ? (object)DBNull.Value : h.Procesador);
                var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(h.Memoria) ? (object)DBNull.Value : h.Memoria);
                var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(h.Disco) ? (object)DBNull.Value : h.Disco);
                var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(h.MarcaPC) ? (object)DBNull.Value : h.MarcaPC);
                var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(h.OtrasConsideraciones) ? (object)DBNull.Value : h.OtrasConsideraciones);
                var pPlaca = new SqlParameter("@Placa", string.IsNullOrEmpty(h.Placa) ? (object)DBNull.Value : h.Placa);

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_GestionarHardwareAsignado @Accion, @Id, @EmpleadoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones, @Placa",
                    pAccion, pId, pEmpleado, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras, pPlaca
                );
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar: {ex.Message}");
            }
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