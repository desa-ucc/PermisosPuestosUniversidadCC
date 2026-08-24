using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
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

        [HttpGet("importar-ideal/plantilla")]
        public IActionResult DescargarPlantillaIdeal()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Hardware Ideal");
                worksheet.Cell(1, 1).Value = "Codigo de Puesto";
                worksheet.Cell(1, 2).Value = "Hardware";
                worksheet.Cell(1, 3).Value = "Tipo de Equipo";
                worksheet.Cell(1, 4).Value = "Procesador";
                worksheet.Cell(1, 5).Value = "Memoria";
                worksheet.Cell(1, 6).Value = "Disco Duro";
                worksheet.Cell(1, 7).Value = "Marca";
                worksheet.Cell(1, 8).Value = "Otras Consideraciones";

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Hardware_Ideal.xlsx");
                }
            }
        }

        [HttpPost("importar-ideal")]
        public async Task<IActionResult> ImportarIdeal(IFormFile file)
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
                    var rows = worksheet.RangeUsed()?.RowsUsed()?.Skip(1); // Saltar encabezados

                    if (rows == null) return BadRequest(new { message = "El archivo no tiene datos válidos." });

                    foreach (var row in rows)
                    {
                        var codPuesto = row.Cell(1).GetValue<string>();
                        var hardwareNombre = row.Cell(2).GetValue<string>();
                        var tipoEq = row.Cell(3).GetValue<string>();
                        var proc = row.Cell(4).GetValue<string>();
                        var mem = row.Cell(5).GetValue<string>();
                        var disco = row.Cell(6).GetValue<string>();
                        var marca = row.Cell(7).GetValue<string>();
                        var otras = row.Cell(8).GetValue<string>();

                        if (string.IsNullOrWhiteSpace(codPuesto))
                        {
                            errores.Add($"Fila {row.RowNumber()}: Código de Puesto vacío.");
                            continue;
                        }

                        // Buscar el ID del Puesto a partir de su Código
                        var p1 = new SqlParameter("@Accion", "SELECT_CODIGO");
                        var p2 = new SqlParameter("@CodigoPuesto", codPuesto);
                        var puestoQuery = await _context.Set<Puesto>().FromSqlRaw("SELECT * FROM pt_Puestos WHERE CodigoPuesto = {0}", codPuesto).ToListAsync();
                        var puesto = puestoQuery.FirstOrDefault();

                        if (puesto == null)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El puesto con código '{codPuesto}' no existe.");
                            continue;
                        }

                        // Buscar el ID del Hardware
                        int? hwId = null;
                        if (!string.IsNullOrWhiteSpace(hardwareNombre))
                        {
                            var pHw1 = new SqlParameter("@Accion", "SELECT_NOMBRE");
                            var pHw2 = new SqlParameter("@Nombre", hardwareNombre);
                            var hwQuery = await _context.Cat_TiposHardware.FromSqlRaw("SELECT Id, Nombre, Estado FROM pt_TiposHardware WHERE Nombre = {0} AND Estado = 1", hardwareNombre).ToListAsync();
                            var hw = hwQuery.FirstOrDefault();

                            if (hw == null)
                            {
                                errores.Add($"Fila {row.RowNumber()}: El tipo de hardware '{hardwareNombre}' no existe.");
                                continue;
                            }
                            hwId = hw.Id;
                        }

                        // Inserción en base de datos
                        try
                        {
                            var pAccion = new SqlParameter("@Accion", "INSERT");
                            var pPuesto = new SqlParameter("@PuestoId", puesto.Id);
                            var pTipoHw = new SqlParameter("@TipoHardwareId", hwId.HasValue ? (object)hwId.Value : DBNull.Value);
                            var pTipoEq = new SqlParameter("@TipoEquipo", string.IsNullOrEmpty(tipoEq) ? (object)DBNull.Value : tipoEq);
                            var pProc = new SqlParameter("@Procesador", string.IsNullOrEmpty(proc) ? (object)DBNull.Value : proc);
                            var pMem = new SqlParameter("@Memoria", string.IsNullOrEmpty(mem) ? (object)DBNull.Value : mem);
                            var pDisco = new SqlParameter("@Disco", string.IsNullOrEmpty(disco) ? (object)DBNull.Value : disco);
                            var pMarca = new SqlParameter("@MarcaPC", string.IsNullOrEmpty(marca) ? (object)DBNull.Value : marca);
                            var pOtras = new SqlParameter("@OtrasConsideraciones", string.IsNullOrEmpty(otras) ? (object)DBNull.Value : otras);

                            await _context.Database.ExecuteSqlRawAsync(
                                "EXEC sp_GestionarHardwareIdeal @Accion, NULL, @PuestoId, @TipoHardwareId, @TipoEquipo, @Procesador, @Memoria, @Disco, @MarcaPC, @OtrasConsideraciones",
                                pAccion, pPuesto, pTipoHw, pTipoEq, pProc, pMem, pDisco, pMarca, pOtras
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
