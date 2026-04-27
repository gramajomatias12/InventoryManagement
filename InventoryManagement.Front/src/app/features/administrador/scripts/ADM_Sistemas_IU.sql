USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Sistemas_IU]
    @jsParametro NVARCHAR(MAX),
    @ip VARCHAR(20) = NULL,
    @userAgent VARCHAR(MAX) = NULL,
    @uiSesion VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @rol VARCHAR(200) = 'ADM_ADM';
    DECLARE @resultado VARCHAR(MAX);
    DECLARE @procId VARCHAR(100);
    DECLARE @cdSesion INT;
    DECLARE @dsLogin VARCHAR(100);
    DECLARE @cdUsuario INT;
    DECLARE @dsPerfil VARCHAR(100);

    SET @procId = OBJECT_NAME(@@PROCID);

    EXECUTE AUTH_Sesiones_S @uiSesion, @userAgent, @ip, @procId, @jsParametro, @resultado OUTPUT, @rol;

    SELECT
        @cdSesion = cdSesion,
        @dsLogin = dsLogin,
        @dsPerfil = dsPerfil,
        @cdUsuario = cdUsuario
    FROM OPENJSON(@resultado)
    WITH (
        cdSesion INT '$.cdSesion',
        dsLogin VARCHAR(100) '$.dsLogin',
        dsPerfil VARCHAR(100) '$.dsPerfil',
        cdUsuario INT '$.cdUsuario'
    );

    IF @cdSesion IS NULL
    BEGIN
        RAISERROR(@resultado, 16, 2);
        RETURN;
    END;

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
