USE [DBPrueba]
GO
/****** Objeto: StoredProcedure [dbo].[PAT_Categorias_S] Fecha de script: 20/04/2026 09:45:13 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- CONSULTA DE CATEGORÍAS
ALTER PROCEDURE [dbo].[PAT_Categorias_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    Select isnull((
    SELECT 
        cdCategoria, 
        dsCategoria, 
        icActivo
    FROM PAT_Categorias
    ORDER BY dsCategoria
   FOR JSON PATH),'[]') as items
END;
