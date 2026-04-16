USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[PAT_Categorias_IU]    Script Date: 16/04/2026 13:24:28 ******/
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
        
        SELECT '{"mensaje": "Categoría creada con éxito"}' AS Respuesta;
    END
    ELSE
    BEGIN
        UPDATE PAT_Categorias
        SET dsCategoria = @dsCategoria,
            icActivo = @icActivo
        WHERE cdCategoria = @cdCategoria;

        SELECT '{"mensaje": "Categoría actualizada con éxito"}' AS Respuesta;
    END
END