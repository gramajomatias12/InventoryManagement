USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[PAT_Proveedores_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdProveedor INT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT @cdProveedor = cdProveedor
        FROM OPENJSON(@jsParametro)
        WITH (cdProveedor INT);
    END
    ELSE
    BEGIN
        SET @cdProveedor = TRY_CAST(@jsParametro AS INT);
    END;

    SELECT ISNULL((
        SELECT
            p.cdProveedor AS id,
            p.dsProveedor,
            p.dsDireccion,
            p.dsTelefono,
            p.dsEmail,
            p.icActivo
        FROM dbo.PAT_Proveedores p
        WHERE (@cdProveedor IS NULL OR p.cdProveedor = @cdProveedor)
        ORDER BY p.dsProveedor
        FOR JSON PATH
    ), '[]') AS items;
END
GO
