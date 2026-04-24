USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Sistemas_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdSistema INT = NULL,
            @soloActivos BIT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdSistema = COALESCE(cdSistema, idSistema),
            @soloActivos = soloActivos
        FROM OPENJSON(@jsParametro)
        WITH (
            cdSistema INT,
            idSistema INT,
            soloActivos BIT
        );
    END
    ELSE
    BEGIN
        SET @cdSistema = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            s.cdSistema AS id,
            s.dsSistema AS descripcion,
            s.dsPrefijo AS prefijo,
            s.icBaja AS icBaja
        FROM dbo.SIS_Sistemas s
        WHERE (@cdSistema IS NULL OR s.cdSistema = @cdSistema)
          AND (@soloActivos IS NULL OR @soloActivos = 0 OR s.icBaja = 0)
        ORDER BY s.dsSistema
        FOR JSON PATH
    ), '[]') AS items;
END
GO
