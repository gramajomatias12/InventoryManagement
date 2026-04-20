USE [DBPrueba]
GO
/****** Objeto: StoredProcedure [dbo].[PAT_Categorias_IU] Fecha de script: 20/04/2026 10:29:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[PAT_Categorias_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdCategoria INT, 
            @dsCategoria NVARCHAR(100), 
            @icActivo BIT;

    SELECT 
        @cdCategoria = cdCategoria,
        @dsCategoria = dsCategoria,
        @icActivo = icActivo
    FROM OPENJSON(@jsParametro)
    WITH (
        cdCategoria INT,
        dsCategoria NVARCHAR(100),
        icActivo BIT
    );

    IF @cdCategoria IS NULL OR @cdCategoria = 0
    BEGIN
        INSERT INTO PAT_Categorias (dsCategoria, icActivo)
        VALUES (@dsCategoria, ISNULL(@icActivo, 1));
        
        select @cdCategoria=@@IDENTITY
    END
    ELSE
    BEGIN
        UPDATE PAT_Categorias
        SET dsCategoria = @dsCategoria,
            icActivo = @icActivo
        WHERE cdCategoria = @cdCategoria;

        select @cdCategoria as id for json path
    END
END