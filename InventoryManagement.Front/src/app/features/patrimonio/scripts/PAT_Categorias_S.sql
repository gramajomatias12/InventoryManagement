USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[PAT_Categorias_S]    Script Date: 16/04/2026 13:21:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- CONSULTA DE CATEGORÍAS
ALTER PROCEDURE [dbo].[PAT_Categorias_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SELECT 
        cdCategoria, 
        dsCategoria, 
        icActivo
    FROM PAT_Categorias
    ORDER BY dsCategoria
    FOR JSON PATH;
END;
