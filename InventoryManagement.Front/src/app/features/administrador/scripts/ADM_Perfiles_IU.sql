USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Perfiles_IU]
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
    DECLARE @dsPerfilSesion VARCHAR(100);

    SET @procId = OBJECT_NAME(@@PROCID);

    EXECUTE AUTH_Sesiones_S @uiSesion, @userAgent, @ip, @procId, @jsParametro, @resultado OUTPUT, @rol;

    SELECT
        @cdSesion = cdSesion,
        @dsLogin = dsLogin,
        @dsPerfilSesion = dsPerfil,
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

        DECLARE @cdPerfil INT,
            @id INT,
            @dsPerfil NVARCHAR(80),
            @cdSistema INT,
            @dsDescripcion NVARCHAR(250),
            @icBorrado BIT,
            @dsPrefijoSistema NVARCHAR(10);

    SELECT
        @cdPerfil = cdPerfil,
        @id = id,
        @dsPerfil = dsPerfil,
        @cdSistema = cdSistema,
        @dsDescripcion = dsDescripcion,
        @icBorrado = icBorrado
    FROM OPENJSON(@jsParametro)
    WITH (
        cdPerfil INT,
        id INT,
        dsPerfil NVARCHAR(80),
        cdSistema INT,
        dsDescripcion NVARCHAR(250),
        icBorrado BIT
    );

    SET @cdPerfil = COALESCE(@cdPerfil, @id);
    SET @icBorrado = ISNULL(@icBorrado, 0);

    SELECT @dsPrefijoSistema = UPPER(LTRIM(RTRIM(dsPrefijo)))
    FROM dbo.SIS_Sistemas
    WHERE cdSistema = @cdSistema;

    IF NULLIF(@dsPrefijoSistema, '') IS NOT NULL
       AND NULLIF(LTRIM(RTRIM(@dsPerfil)), '') IS NOT NULL
       AND UPPER(@dsPerfil) NOT LIKE @dsPrefijoSistema + '_%'
    BEGIN
        SET @dsPerfil = @dsPrefijoSistema + '_' + UPPER(LTRIM(RTRIM(@dsPerfil)));
    END

    IF @cdPerfil IS NULL OR @cdPerfil = 0
    BEGIN
        INSERT INTO dbo.ADM_Perfiles (dsPerfil, cdSistema, dsDescripcion, icBorrado)
        VALUES (@dsPerfil, @cdSistema, @dsDescripcion, @icBorrado);

        SELECT @cdPerfil = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.ADM_Perfiles
        SET dsPerfil = @dsPerfil,
            cdSistema = @cdSistema,
            dsDescripcion = @dsDescripcion,
            icBorrado = @icBorrado
        WHERE cdPerfil = @cdPerfil;
    END

    SELECT @cdPerfil AS id FOR JSON PATH;
END
GO
