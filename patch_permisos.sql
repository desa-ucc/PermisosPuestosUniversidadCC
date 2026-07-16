INSERT INTO pt_Permisos (RolId, Pantalla, CanRead, CanWrite, CanDelete)
SELECT Id, 'ADMINBASEDATOS', 1, 1, 1 FROM pt_Roles;
GO
