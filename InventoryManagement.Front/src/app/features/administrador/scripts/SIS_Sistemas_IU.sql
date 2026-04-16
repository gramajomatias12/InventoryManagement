USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[SIS_Sistemas_IU]    Script Date: 13/04/2026 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SIS_Sistemas_IU]
    @jsParametro NVARCHAR(MAX) -- Aqui llega el objeto que mandas desde Angular
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Declaramos variables para extraer los datos del JSON
        DECLARE @cdSistema INT,
            @idSistema INT,
            @id INT,
            @descripcion NVARCHAR(100),
            @prefijo NVARCHAR(10),
            @icBaja BIT;

    -- 2. Mapeamos los valores del JSON a las variables
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

    -- Compatibilidad: acepta cdSistema, idSistema o id
    SET @cdSistema = COALESCE(@cdSistema, @idSistema, @id);

    IF @icBaja IS NULL
        SET @icBaja = 0;

    -- 3. Logica de insercion o actualizacion
    IF @cdSistema IS NULL OR @cdSistema = 0
    BEGIN
        INSERT INTO SIS_Sistemas (dsSistema, dsPrefijo, icBaja)
        VALUES (@descripcion, @prefijo, @icBaja);

        SELECT '{"mensaje": "Sistema creado con exito"}' AS Respuesta;
    END
    ELSE
    BEGIN
        UPDATE SIS_Sistemas
        SET dsSistema = @descripcion,
            dsPrefijo = @prefijo,
            icBaja = @icBaja
        WHERE cdSistema = @cdSistema;

        SELECT '{"mensaje": "Sistema actualizado con exito"}' AS Respuesta;
    END
END
GO
