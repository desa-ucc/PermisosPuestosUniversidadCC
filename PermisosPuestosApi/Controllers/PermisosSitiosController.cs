using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PermisosPuestosApi.Data;
using PermisosPuestosApi.Models;

namespace PermisosPuestosApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PermisosSitiosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermisosSitiosController(AppDbContext context)
        {
            _context = context;
        }

       [HttpGet]
        public async Task<IActionResult> GetPermisosSitios()
        {
            var data = await _context.Database.SqlQueryRaw<PermisosSitio>(
                "select * from v_GestionarPermisosSitios"
            ).ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePermisosSitio([FromBody] PermisosSitio ps)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='INSERT', @EmpleadoId=@e, @Sitio=@s, @Ambiente=@a, @GruposPermisos=@g",
                new SqlParameter("@e", ps.EmpleadoId),
                new SqlParameter("@s", ps.Sitio ?? (object)DBNull.Value),
                new SqlParameter("@a", ps.Ambiente ?? (object)DBNull.Value),
                new SqlParameter("@g", ps.GruposPermisos ?? (object)DBNull.Value)
            );
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermisosSitio(int id, [FromBody] PermisosSitio ps)
        {
            if (id != ps.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='UPDATE', @Id=@id, @EmpleadoId=@e, @Sitio=@s, @Ambiente=@a, @GruposPermisos=@g",
                new SqlParameter("@id", id),
                new SqlParameter("@e", ps.EmpleadoId),
                new SqlParameter("@s", ps.Sitio ?? (object)DBNull.Value),
                new SqlParameter("@a", ps.Ambiente ?? (object)DBNull.Value),
                new SqlParameter("@g", ps.GruposPermisos ?? (object)DBNull.Value)
            );
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermisosSitio(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPermisosSitios @Accion='DELETE', @Id=@id", 
                new SqlParameter("@id", id)
            );
            return NoContent();
        }

        [HttpGet("importar-sitios/plantilla")]
        public IActionResult DescargarPlantillaSitios()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Permisos Sitios");
                worksheet.Cell(1, 1).Value = "Código de Empleado";
                worksheet.Cell(1, 2).Value = "Sitio";
                worksheet.Cell(1, 3).Value = "Ambiente";
                worksheet.Cell(1, 4).Value = "Grupos y Permisos";

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Permisos_Sitios.xlsx");
                }
            }
        }

        [HttpPost("importar-sitios")]
        public async Task<IActionResult> ImportarPermisosSitios(IFormFile file)
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
                        var sitioStr = row.Cell(2).GetValue<string>();
                        var ambienteStr = row.Cell(3).GetValue<string>();
                        var grupos = row.Cell(4).GetValue<string>();

                        if (string.IsNullOrWhiteSpace(codEmpleado))
                        {
                            errores.Add($"Fila {row.RowNumber()}: Código de Empleado vacío.");
                            continue;
                        }

                        // Validación Empleado
                        var empQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_Empleados WHERE CodigoEmpleado = {0}", codEmpleado).ToListAsync();
                        var empleadoId = empQuery.FirstOrDefault();
                        if (empleadoId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El empleado con código '{codEmpleado}' no existe.");
                            continue;
                        }

                        // Validación Sitio (Obligatorio)
                        var sitioQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_Sitios WHERE Nombre = {0}", sitioStr).ToListAsync();
                        var sitioId = sitioQuery.FirstOrDefault();
                        if (sitioId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El Sitio '{sitioStr}' no existe en el catálogo.");
                            continue;
                        }

                        // Validación Ambiente (Opcional, pero si viene debe existir o lo dejamos vacio/N/A, segun las reglas lo pasamos o validamos. El catalogo existe)
                        int? ambienteId = null;
                        if (!string.IsNullOrWhiteSpace(ambienteStr))
                        {
                            var ambQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_Ambientes WHERE Nombre = {0}", ambienteStr).ToListAsync();
                            var aId = ambQuery.FirstOrDefault();
                            if (aId == 0)
                            {
                                errores.Add($"Fila {row.RowNumber()}: El Ambiente '{ambienteStr}' no existe en el catálogo.");
                                continue;
                            }
                            ambienteId = aId;
                        }

                        grupos = string.IsNullOrWhiteSpace(grupos) ? "N/A" : grupos;

                        try
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "EXEC sp_GestionarPermisosSitios @Accion='INSERT', @EmpleadoId=@e, @Sitio=@s, @Ambiente=@a, @GruposPermisos=@g",
                                new SqlParameter("@e", empleadoId),
                                new SqlParameter("@s", sitioId.ToString()),
                                new SqlParameter("@a", ambienteId.HasValue ? (object)ambienteId.Value.ToString() : DBNull.Value),
                                new SqlParameter("@g", grupos)
                            );

                            insertados++;
                        }
                        catch (Exception ex)
                        {
                            errores.Add($"Fila {row.RowNumber()}: Error de BD ({ex.Message}).");
                        }
                    }
                }
            }

            return Ok(new { TotalExitosos = insertados, TotalFallidos = errores.Count, Errores = errores });
        }

    }
}
