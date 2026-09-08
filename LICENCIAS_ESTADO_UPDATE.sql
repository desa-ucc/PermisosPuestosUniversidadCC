-- =========================================================================================
-- SCRIPT: GESTIÓN DE ESTADO (ACTIVO/INACTIVO) PARA INVENTARIO DE LICENCIAS
-- =========================================================================================

-- Agregar columna Activo a la tabla (por defecto 1 = true)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[pt_TiposLicencia]') AND name = 'Activo')
BEGIN
    ALTER TABLE pt_TiposLicencia ADD Activo BIT NOT NULL DEFAULT 1;
END
GO

-- Recrear la vista v_GestionarTiposLicencia para incluir Activo
CREATE OR ALTER VIEW v_GestionarTiposLicencia AS
SELECT
    t.Id,
    t.Nombre,
    t.CantidadContratada,
    t.FechaVencimiento,
    t.Activo,
    (t.CantidadContratada - (SELECT COUNT(*) FROM pt_Plataformas p WHERE p.Licencias = CAST(t.Id AS NVARCHAR) OR p.Licencias = t.Nombre)) AS Disponibles
FROM pt_TiposLicencia t;
GO

-- Recrear SP de inserción y actualización
CREATE OR ALTER PROCEDURE sp_GestionarTiposLicencia
    @Accion NVARCHAR(20),
    @Id INT = NULL,
    @Nombre NVARCHAR(100) = NULL,
    @CantidadContratada INT = 0,
    @FechaVencimiento DATE = NULL,
    @Activo BIT = 1
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
        INSERT INTO pt_TiposLicencia (Nombre, CantidadContratada, FechaVencimiento, Activo)
        VALUES (@Nombre, @CantidadContratada, @FechaVencimiento, @Activo);
    END
    ELSE IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_TiposLicencia
        SET Nombre = @Nombre,
            CantidadContratada = @CantidadContratada,
            FechaVencimiento = @FechaVencimiento,
            Activo = @Activo
        WHERE Id = @Id;
    END
    ELSE IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_TiposLicencia WHERE Id = @Id;
    END
END;
GO
