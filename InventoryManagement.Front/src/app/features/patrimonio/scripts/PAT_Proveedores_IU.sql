USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[PAT_Proveedores_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdProveedor INT,
            @id INT,
            @dsProveedor NVARCHAR(100),
            @dsDireccion NVARCHAR(200),
            @dsTelefono NVARCHAR(20),
            @dsEmail NVARCHAR(100),
            @icActivo BIT;

    SELECT
        @cdProveedor = cdProveedor,
        @id = id,
        @dsProveedor = dsProveedor,
        @dsDireccion = dsDireccion,
        @dsTelefono = dsTelefono,
        @dsEmail = dsEmail,
        @icActivo = icActivo
    FROM OPENJSON(@jsParametro)
    WITH (
        cdProveedor INT,
        id INT,
        dsProveedor NVARCHAR(100),
        dsDireccion NVARCHAR(200),
        dsTelefono NVARCHAR(20),
        dsEmail NVARCHAR(100),
        icActivo BIT
    );

    SET @cdProveedor = COALESCE(@cdProveedor, @id);
    SET @icActivo = ISNULL(@icActivo, 1);

    IF @cdProveedor IS NULL OR @cdProveedor = 0
    BEGIN
        INSERT INTO dbo.PAT_Proveedores (dsProveedor, dsDireccion, dsTelefono, dsEmail, icActivo)
        VALUES (@dsProveedor, @dsDireccion, @dsTelefono, @dsEmail, @icActivo);

        SELECT @cdProveedor = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.PAT_Proveedores
        SET dsProveedor = @dsProveedor,
            dsDireccion = @dsDireccion,
            dsTelefono = @dsTelefono,
            dsEmail = @dsEmail,
            icActivo = @icActivo
        WHERE cdProveedor = @cdProveedor;
    END;

    SELECT @cdProveedor AS id FOR JSON PATH;
END
GO
