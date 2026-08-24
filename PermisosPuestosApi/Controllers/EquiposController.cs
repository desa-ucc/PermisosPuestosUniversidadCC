using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
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

        [HttpGet("importar-asignado/plantilla")]
        public IActionResult DescargarPlantillaAsignado()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Hardware Asignado");
                worksheet.Cell(1, 1).Value = "Código de Empleado";
                worksheet.Cell(1, 2).Value = "Tipo de Equipo";
                worksheet.Cell(1, 3).Value = "Procesador";
                worksheet.Cell(1, 4).Value = "Memoria";
                worksheet.Cell(1, 5).Value = "Disco Duro";
                worksheet.Cell(1, 6).Value = "Marca";
                worksheet.Cell(1, 7).Value = "Otras Consideraciones";

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Hardware_Asignado.xlsx");
                }
            }
        }

        [HttpPost("importar-asignado")]
        public async Task<IActionResult> ImportarAsignado(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "El archivo está vacío." });

            int insertados = 0;
            var errores = new List<string>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);
                    var rows = worksheet.RangeUsed()?.RowsUsed()?.Skip(1);

                    if (rows == null) return BadRequest(new { message = "El archivo no tiene datos válidos." });

                    foreach (var row in rows)
                    {
                        var codEmpleado = row.Cell(1).GetValue<string>();
                        var tipoEq = row.Cell(2).GetValue<string>();
                        var hardwareNombre = tipoEq; // Alias the column
                        var proc = row.Cell(3).GetValue<string>();
                        var mem = row.Cell(4).GetValue<string>();
                        var disco = row.Cell(5).GetValue<string>();
                        var marca = row.Cell(6).GetValue<string>();
                        var otras = row.Cell(7).GetValue<string>();

                        if (string.IsNullOrWhiteSpace(codEmpleado))
                        {
                            errores.Add($"Fila {row.RowNumber()}: Código de Empleado vacío.");
                            continue;
                        }

                        // Buscar el ID del Empleado a partir de su Código
                        var empQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_Empleados WHERE CodigoEmpleado = {0}", codEmpleado).ToListAsync();
                        var empleadoId = empQuery.FirstOrDefault();

                        if (empleadoId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El empleado con código '{codEmpleado}' no existe.");
                            continue;
                        }

                        // Buscar el ID del Hardware
                        int? hwId = null;
                        if (!string.IsNullOrWhiteSpace(hardwareNombre))
                        {
                            var hwQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_TiposHardware WHERE Nombre = {0}", hardwareNombre).ToListAsync();
                            var h = hwQuery.FirstOrDefault();

                            if (h == 0)
                            {
                                errores.Add($"Fila {row.RowNumber()}: El tipo de hardware '{hardwareNombre}' no existe.");
                                continue;
                            }
                            hwId = h;
                        }

                        // Inserción en base de datos
                        try
                        {
                            var pAccion = new SqlParameter("@Accion", "INSERT");
                            var pEmpleado = new SqlParameter("@EmpleadoId", empleadoId);
                            var pTipoHw = new SqlParameter("@TipoHardwareId", hwId.HasValue ? (object)hwId.Value : DBNull.Value);
                            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(tipoEq) ? (object)DBNull.Value : tipoEq);
                            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(proc) ? (object)DBNull.Value : proc);
                            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(mem) ? (object)DBNull.Value : mem);
                            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(disco) ? (object)DBNull.Value : disco);
                            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(marca) ? (object)DBNull.Value : marca);
                            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(otras) ? (object)DBNull.Value : otras);

                            await _context.Database.ExecuteSqlRawAsync(
                                "EXEC sp_GestionarHardwareAsignado @Accion, NULL, @EmpleadoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones",
                                pAccion, pEmpleado, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras
                            );

                            insertados++;
                        }
                        catch (Exception ex)
                        {
                            errores.Add($"Fila {row.RowNumber()}: Error de base de datos ({ex.Message}).");
                        }
                    }
                }
            }

            return Ok(new {
                TotalExitosos = insertados,
                TotalFallidos = errores.Count,
                Errores = errores
            });
        }

    }
}
