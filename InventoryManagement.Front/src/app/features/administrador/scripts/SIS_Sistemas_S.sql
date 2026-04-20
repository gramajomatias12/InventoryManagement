USE [DBPrueba]
GO
/****** Objeto: StoredProcedure [dbo].[SIS_Sistemas_S] Fecha de script: 20/04/2026 09:39:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   PROCEDURE [dbo].[SIS_Sistemas_S]
    @jsParametro NVARCHAR(MAX) = NULL -- Recibe el parametro pero puede venir vacio
AS
BEGIN
    SET NOCOUNT ON;

    -- Permite filtro opcional por cdSistema y soloActivos
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
        -- Soporta GET con parametro simple: /api/Entidad/Sistemas/{id}
        SET @cdSistema = TRY_CAST(@jsParametro AS INT);
    END

    select isnull((
    SELECT
        s.cdSistema AS id,
        s.dsSistema AS descripcion,
        s.dsPrefijo AS prefijo,
        s.icBaja AS icBaja
    FROM SIS_Sistemas s
    WHERE (@cdSistema IS NULL OR s.cdSistema = @cdSistema)
      AND (@soloActivos IS NULL OR @soloActivos = 0 OR s.icBaja = 0)
    ORDER BY s.dsSistema
    FOR JSON PATH),'[]') as items
END
