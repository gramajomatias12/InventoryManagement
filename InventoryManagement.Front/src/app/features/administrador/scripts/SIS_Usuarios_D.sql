USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[SIS_Usuarios_D]    Script Date: 16/04/2026 12:33:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SIS_Usuarios_D]
    @jsParametro NVARCHAR(MAX) -- Recibe el JSON con el ID
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @cdUsuario INT;

    -- Extraemos solo el ID del usuario
    SELECT @cdUsuario = cdUsuario 
    FROM OPENJSON(@jsParametro) 
    WITH (cdUsuario INT);

    IF EXISTS (SELECT 1 FROM Usuarios WHERE cdUsuario = @cdUsuario)
    BEGIN
        DELETE FROM Usuarios WHERE cdUsuario = @cdUsuario;
        SELECT '{"mensaje": "Usuario eliminado correctamente"}' AS Respuesta;
    END
    ELSE
    BEGIN
        SELECT '{"mensaje": "Error: Usuario no encontrado", "error": true}' AS Respuesta;
    END
END