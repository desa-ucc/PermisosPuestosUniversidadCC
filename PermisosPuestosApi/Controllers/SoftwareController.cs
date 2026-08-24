using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using System.IO;
using System.Linq;
using System.Collections.Generic;
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
                "select * from v_GestionarSoftwareLocal"
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

        [HttpGet("importar-local/plantilla")]
        public IActionResult DescargarPlantillaLocal()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Software Local");
                worksheet.Cell(1, 1).Value = "Código de Empleado";
                worksheet.Cell(1, 2).Value = "Equipo";
                worksheet.Cell(1, 3).Value = "Grupos AD";
                worksheet.Cell(1, 4).Value = "Nombre del Software";
                worksheet.Cell(1, 5).Value = "Versión";
                worksheet.Cell(1, 6).Value = "Fabricante";

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Software_Local.xlsx");
                }
            }
        }

        [HttpPost("importar-local")]
        public async Task<IActionResult> ImportarLocal(IFormFile file)
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
                        var equipo = row.Cell(2).GetValue<string>();
                        var grupos = row.Cell(3).GetValue<string>();
                        var nombreSoft = row.Cell(4).GetValue<string>();
                        var version = row.Cell(5).GetValue<string>();
                        var fabricante = row.Cell(6).GetValue<string>();

                        if (string.IsNullOrWhiteSpace(codEmpleado))
                        {
                            errores.Add($"Fila {row.RowNumber()}: Código de Empleado vacío.");
                            continue;
                        }

                        // Buscar el ID del Empleado (Mapeo seguro con proyección sin Estado)
                        var empQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_Empleados WHERE CodigoEmpleado = {0}", codEmpleado).ToListAsync();
                        var empleadoId = empQuery.FirstOrDefault();

                        if (empleadoId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El empleado con código '{codEmpleado}' no existe.");
                            continue;
                        }

                        // Asignación de nulos a "N/A"
                        grupos = string.IsNullOrWhiteSpace(grupos) ? "N/A" : grupos;
                        version = string.IsNullOrWhiteSpace(version) ? "N/A" : version;
                        fabricante = string.IsNullOrWhiteSpace(fabricante) ? "N/A" : fabricante;
                        equipo = string.IsNullOrWhiteSpace(equipo) ? "N/A" : equipo;
                        nombreSoft = string.IsNullOrWhiteSpace(nombreSoft) ? "N/A" : nombreSoft;

                        try
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "EXEC sp_GestionarSoftwareLocal @Accion='INSERT', @EmpleadoId=@e, @Equipo=@eq, @GruposAD=@g, @NombreSoftware=@n, @Version=@v, @Fabricante=@f",
                                new SqlParameter("@e", empleadoId),
                                new SqlParameter("@eq", equipo),
                                new SqlParameter("@g", grupos),
                                new SqlParameter("@n", nombreSoft),
                                new SqlParameter("@v", version),
                                new SqlParameter("@f", fabricante)
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
