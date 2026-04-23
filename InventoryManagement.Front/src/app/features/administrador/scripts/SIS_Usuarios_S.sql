USE [DBPrueba]
GO
/****** Objeto: StoredProcedure [dbo].[SIS_Usuarios_S] Fecha de script: 20/04/2026 09:41:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SIS_Usuarios_S]
    @jsParametro NVARCHAR(MAX)  = NULL -- Recibe el parámetro basura pero lo ignora
AS
BEGIN
select isnull((
    SELECT 
        u.cdUsuario, 
        u.dsLogin, 
        u.dsContraseña,
        u.dsNombre, 
        u.dsApellido, 
        u.dsEmail, 
        u.icActivo, 
        u.dtCreacion
    FROM Usuarios u
    ORDER BY u.dtCreacion DESC
    FOR JSON PATH),'[]') as items
END;