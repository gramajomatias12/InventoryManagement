USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Perfiles_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdPerfil INT = NULL,
            @cdSistema INT = NULL,
            @soloActivos BIT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdPerfil = cdPerfil,
            @cdSistema = cdSistema,
            @soloActivos = soloActivos
        FROM OPENJSON(@jsParametro)
        WITH (
            cdPerfil INT,
            cdSistema INT,
            soloActivos BIT
        );
    END
    ELSE
    BEGIN
        SET @cdPerfil = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            p.cdPerfil,
            p.dsPerfil,
            p.cdSistema,
            s.dsSistema AS dsSistema,
            p.dsDescripcion,
            p.dsRoles,
            p.icBorrado
        FROM dbo.ADM_Perfiles p
        INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = p.cdSistema
        WHERE (@cdPerfil IS NULL OR p.cdPerfil = @cdPerfil)
          AND (@cdSistema IS NULL OR p.cdSistema = @cdSistema)
          AND (@soloActivos IS NULL OR @soloActivos = 0 OR p.icBorrado = 0)
        ORDER BY p.dsPerfil
        FOR JSON PATH
    ), '[]') AS items;
END
GO
