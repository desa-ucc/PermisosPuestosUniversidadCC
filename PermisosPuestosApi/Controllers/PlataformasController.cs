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
    public class PlataformasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PlataformasController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetPlataformas()
        {
            var data = await _context.Database.SqlQueryRaw<Plataforma>(
                "select * from v_GestionarPlataformas"
            ).ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlataforma([FromBody] Plataforma p)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='INSERT', @EmpleadoId=@e, @NombrePlataforma=@n, @Licencias=@l, @Modulos=@m, @AccesosPermisos=@a, @NivelAcceso=@na",
                new SqlParameter("@e", p.EmpleadoId),
                new SqlParameter("@n", p.NombrePlataforma ?? (object)DBNull.Value),
                new SqlParameter("@l", p.Licencias ?? (object)DBNull.Value),
                new SqlParameter("@m", p.Modulos ?? (object)DBNull.Value),
                new SqlParameter("@a", p.AccesosPermisos ?? (object)DBNull.Value),
                new SqlParameter("@na", p.NivelAcceso ?? (object)DBNull.Value)
            );
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlataforma(int id, [FromBody] Plataforma p)
        {
            if (id != p.Id) return BadRequest();

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='UPDATE', @Id=@id, @EmpleadoId=@e, @NombrePlataforma=@n, @Licencias=@l, @Modulos=@m, @AccesosPermisos=@a, @NivelAcceso=@na",
                new SqlParameter("@id", id),
                new SqlParameter("@e", p.EmpleadoId),
                new SqlParameter("@n", p.NombrePlataforma ?? (object)DBNull.Value),
                new SqlParameter("@l", p.Licencias ?? (object)DBNull.Value),
                new SqlParameter("@m", p.Modulos ?? (object)DBNull.Value),
                new SqlParameter("@a", p.AccesosPermisos ?? (object)DBNull.Value),
                new SqlParameter("@na", p.NivelAcceso ?? (object)DBNull.Value)
            );
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlataforma(int id)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GestionarPlataformas @Accion='DELETE', @Id=@id",
                new SqlParameter("@id", id)
            );
            return NoContent();
        }

        [HttpGet("importar-plataformas/plantilla")]
        public IActionResult DescargarPlantillaPlataformas()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Plataformas");
                worksheet.Cell(1, 1).Value = "Código de Empleado";
                worksheet.Cell(1, 2).Value = "Nombre de la Plataforma";
                worksheet.Cell(1, 3).Value = "Tipo de Licencia";
                worksheet.Cell(1, 4).Value = "Módulos";
                worksheet.Cell(1, 5).Value = "Accesos y Permisos";
                worksheet.Cell(1, 6).Value = "Nivel de Acceso";

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Plantilla_Plataformas.xlsx");
                }
            }
        }

        [HttpPost("importar-plataformas")]
        public async Task<IActionResult> ImportarPlataformas(IFormFile file)
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
                        var plataformaStr = row.Cell(2).GetValue<string>();
                        var licenciaStr = row.Cell(3).GetValue<string>();
                        var modulos = row.Cell(4).GetValue<string>();
                        var accesos = row.Cell(5).GetValue<string>();
                        var nivelStr = row.Cell(6).GetValue<string>();

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

                        // Validación Nombre de Plataforma (Obligatorio)
                        var platQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_PlataformasNombres WHERE Nombre = {0}", plataformaStr).ToListAsync();
                        var plataformaId = platQuery.FirstOrDefault();
                        if (plataformaId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: La Plataforma '{plataformaStr}' no existe en el catálogo.");
                            continue;
                        }

                        // Validación Tipo Licencia (Obligatorio)
                        var licQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_TiposLicencia WHERE Nombre = {0}", licenciaStr).ToListAsync();
                        var licenciaId = licQuery.FirstOrDefault();
                        if (licenciaId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: La Licencia '{licenciaStr}' no existe en el catálogo.");
                            continue;
                        }

                        // Validación Nivel Acceso (Obligatorio)
                        var nivQuery = await _context.Database.SqlQueryRaw<int>("SELECT Id AS Value FROM pt_NivelesAcceso WHERE Nombre = {0}", nivelStr).ToListAsync();
                        var nivelId = nivQuery.FirstOrDefault();
                        if (nivelId == 0)
                        {
                            errores.Add($"Fila {row.RowNumber()}: El Nivel de Acceso '{nivelStr}' no existe en el catálogo.");
                            continue;
                        }

                        modulos = string.IsNullOrWhiteSpace(modulos) ? "N/A" : modulos;
                        accesos = string.IsNullOrWhiteSpace(accesos) ? "N/A" : accesos;

                        try
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "EXEC sp_GestionarPlataformas @Accion='INSERT', @EmpleadoId=@e, @NombrePlataforma=@n, @Licencias=@l, @Modulos=@m, @AccesosPermisos=@a, @NivelAcceso=@na",
                                new SqlParameter("@e", empleadoId),
                                new SqlParameter("@n", plataformaId.ToString()),
                                new SqlParameter("@l", licenciaId.ToString()),
                                new SqlParameter("@m", modulos),
                                new SqlParameter("@a", accesos),
                                new SqlParameter("@na", nivelId.ToString())
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
