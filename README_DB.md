# Database Update Requirement

You must run this script in your SQL Server database to add `CantidadContratada`, `FechaVencimiento`, and compute `Disponibles` for the Licencias catalog.

```sql
-- Agregar columnas a la tabla de licencias
ALTER TABLE pt_TiposLicencia ADD CantidadContratada INT NOT NULL DEFAULT 0;
ALTER TABLE pt_TiposLicencia ADD FechaVencimiento DATE NULL;
GO

-- Recrear la vista v_GestionarTiposLicencia para incluir Disponibles
CREATE OR ALTER VIEW v_GestionarTiposLicencia AS
SELECT
    t.Id,
    t.Nombre,
    t.CantidadContratada,
    t.FechaVencimiento,
    -- Calcular Disponibles restando las asignadas en Plataformas (pt_Plataformas usa el Id en 'Licencias' o el Nombre)
    (t.CantidadContratada - (SELECT COUNT(*) FROM pt_Plataformas p WHERE p.Licencias = CAST(t.Id AS NVARCHAR) OR p.Licencias = t.Nombre)) AS Disponibles
FROM pt_TiposLicencia t;
GO

-- Recrear SP de inserción y actualización
CREATE OR ALTER PROCEDURE sp_GestionarTiposLicencia
    @Accion NVARCHAR(20),
    @Id INT = NULL,
    @Nombre NVARCHAR(100) = NULL,
    @CantidadContratada INT = 0,
    @FechaVencimiento DATE = NULL
AS
BEGIN
    IF @Accion = 'SELECT'
    BEGIN
        SELECT * FROM v_GestionarTiposLicencia;
    END
    ELSE IF @Accion = 'SELECT_ID'
    BEGIN
        SELECT * FROM v_GestionarTiposLicencia WHERE Id = @Id;
    END
    ELSE IF @Accion = 'INSERT'
    BEGIN
        INSERT INTO pt_TiposLicencia (Nombre, CantidadContratada, FechaVencimiento)
        VALUES (@Nombre, @CantidadContratada, @FechaVencimiento);
    END
    ELSE IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_TiposLicencia
        SET Nombre = @Nombre,
            CantidadContratada = @CantidadContratada,
            FechaVencimiento = @FechaVencimiento
        WHERE Id = @Id;
    END
    ELSE IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_TiposLicencia WHERE Id = @Id;
    END
END;
GO
```
