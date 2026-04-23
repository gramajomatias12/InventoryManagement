USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_PerfilesRoles_D]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdPerfil INT,
            @cdRol INT;

    SELECT
        @cdPerfil = cdPerfil,
        @cdRol = cdRol
    FROM OPENJSON(@jsParametro)
    WITH (
        cdPerfil INT,
        cdRol INT
    );

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_PerfilesRoles
        WHERE cdPerfil = @cdPerfil
          AND cdRol = @cdRol
    )
    BEGIN
        DELETE FROM dbo.ADM_PerfilesRoles
        WHERE cdPerfil = @cdPerfil
          AND cdRol = @cdRol;

        SELECT '{"mensaje":"PerfilRol eliminado correctamente"}' AS Respuesta;
    END
    ELSE
    BEGIN
        SELECT '{"mensaje":"No existe la relacion PerfilRol", "error": true}' AS Respuesta;
    END
END
GO
