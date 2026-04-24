USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Sistemas_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdSistema INT,
            @idSistema INT,
            @id INT,
            @descripcion NVARCHAR(100),
            @prefijo NVARCHAR(10),
            @icBaja BIT;

    SELECT
        @cdSistema = cdSistema,
        @idSistema = idSistema,
        @id = id,
        @descripcion = descripcion,
        @prefijo = prefijo,
        @icBaja = icBaja
    FROM OPENJSON(@jsParametro)
    WITH (
        cdSistema INT,
        idSistema INT,
        id INT,
        descripcion NVARCHAR(100),
        prefijo NVARCHAR(10),
        icBaja BIT
    );

    SET @cdSistema = COALESCE(@cdSistema, @idSistema, @id);
    SET @icBaja = ISNULL(@icBaja, 0);

    IF @cdSistema IS NULL OR @cdSistema = 0
    BEGIN
        INSERT INTO dbo.SIS_Sistemas (dsSistema, dsPrefijo, icBaja)
        VALUES (@descripcion, @prefijo, @icBaja);

        SET @cdSistema = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.SIS_Sistemas
        SET dsSistema = @descripcion,
            dsPrefijo = @prefijo,
            icBaja = @icBaja
        WHERE cdSistema = @cdSistema;
    END

    SELECT @cdSistema AS id FOR JSON PATH;
END
GO
