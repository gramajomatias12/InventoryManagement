USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[SIS_Usuarios_S]    Script Date: 16/04/2026 12:32:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SIS_Usuarios_S]
    @jsParametro NVARCHAR(MAX)  = NULL 
AS
BEGIN
    SELECT 
        u.cdUsuario, 
        u.dsLogin, 
        u.dsContraseña,
        u.dsNombre, 
        u.dsApellido, 
        u.dsEmail, 
        u.cdRol, 
        r.dsRol, 
        u.icActivo, 
        u.dtCreacion
    FROM Usuarios u
    INNER JOIN Roles r ON u.cdRol = r.cdRol
    ORDER BY u.dtCreacion DESC
    FOR JSON PATH;
END;