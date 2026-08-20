ALTER PROCEDURE [dbo].[sp_GestionarPermisos]
    @Accion NVARCHAR(20),
    @Id INT = NULL,
    @RoleId INT = NULL,
    @PantallaId NVARCHAR(100) = NULL,
    @PuedeCrear BIT = 0,
    @PuedeEditar BIT = 0,
    @PuedeEliminar BIT = 0,
    @PuedeVer BIT = 0,
    @JsonData NVARCHAR(MAX) = NULL
AS
BEGIN
    -- SELECT: Carga los permisos de un rol específico
    IF @Accion = 'SELECT'
    BEGIN
        SELECT Id, RoleId, PantallaId, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeVer
        FROM pt_Permisos
        WHERE (@RoleId IS NULL OR RoleId = @RoleId)
    END

    -- INSERT: Crea un nuevo registro de permiso
    IF @Accion = 'INSERT'
    BEGIN
        INSERT INTO pt_Permisos (RoleId, PantallaId, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeVer)
        VALUES (@RoleId, @PantallaId, @PuedeCrear, @PuedeEditar, @PuedeEliminar, @PuedeVer)
    END

    -- UPDATE: Actualiza los permisos existentes
    IF @Accion = 'UPDATE'
    BEGIN
        UPDATE pt_Permisos
        SET PuedeCrear = @PuedeCrear,
            PuedeEditar = @PuedeEditar,
            PuedeEliminar = @PuedeEliminar,
            PuedeVer = @PuedeVer
        WHERE Id = @Id OR (RoleId = @RoleId AND PantallaId = @PantallaId)
    END

    -- DELETE: Elimina un permiso
    IF @Accion = 'DELETE'
    BEGIN
        DELETE FROM pt_Permisos WHERE Id = @Id
    END

    -- BULK_UPDATE: Actualiza/Inserta masivamente usando JSON
    IF @Accion = 'BULK_UPDATE' AND @JsonData IS NOT NULL
    BEGIN
        MERGE INTO pt_Permisos AS Target
        USING (
            SELECT RoleId, PantallaId, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeVer
            FROM OPENJSON(@JsonData)
            WITH (
                RoleId INT '$.roleId',
                PantallaId NVARCHAR(100) '$.pantallaId',
                PuedeCrear BIT '$.puedeCrear',
                PuedeEditar BIT '$.puedeEditar',
                PuedeEliminar BIT '$.puedeEliminar',
                PuedeVer BIT '$.puedeVer'
            )
        ) AS Source
        ON (Target.RoleId = Source.RoleId AND Target.PantallaId = Source.PantallaId)
        WHEN MATCHED THEN
            UPDATE SET
                Target.PuedeCrear = Source.PuedeCrear,
                Target.PuedeEditar = Source.PuedeEditar,
                Target.PuedeEliminar = Source.PuedeEliminar,
                Target.PuedeVer = Source.PuedeVer
        WHEN NOT MATCHED BY TARGET THEN
            INSERT (RoleId, PantallaId, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeVer)
            VALUES (Source.RoleId, Source.PantallaId, Source.PuedeCrear, Source.PuedeEditar, Source.PuedeEliminar, Source.PuedeVer);
    END
END
