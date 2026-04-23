USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_D]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT,
            @cdPerfil INT;

    SELECT
        @cdUsuario = cdUsuario,
        @cdPerfil = cdPerfil
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdPerfil INT
    );

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil
    )
    BEGIN
        DELETE FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil;

        SELECT '{"mensaje":"UsuarioPerfil eliminado correctamente"}' AS Respuesta;
    END
    ELSE
    BEGIN
        SELECT '{"mensaje":"No existe la relacion UsuarioPerfil", "error": true}' AS Respuesta;
    END
END
GO
