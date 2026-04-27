USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Roles_IU]
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

    DECLARE @cdRol INT,
            @id INT,
            @dsRol NVARCHAR(50),
            @cdSistema INT,
            @dsNombre NVARCHAR(100),
            @dsDescripcion NVARCHAR(250),
            @icBorrado BIT;

    SELECT
        @cdRol = cdRol,
        @id = id,
        @dsRol = dsRol,
        @cdSistema = cdSistema,
        @dsNombre = dsNombre,
        @dsDescripcion = dsDescripcion,
        @icBorrado = icBorrado
    FROM OPENJSON(@jsParametro)
    WITH (
        cdRol INT,
        id INT,
        dsRol NVARCHAR(50),
        cdSistema INT,
        dsNombre NVARCHAR(100),
        dsDescripcion NVARCHAR(250),
        icBorrado BIT
    );

    SET @cdRol = COALESCE(@cdRol, @id);
    SET @icBorrado = ISNULL(@icBorrado, 0);

    IF @cdRol IS NULL OR @cdRol = 0
    BEGIN
        INSERT INTO dbo.ADM_Roles (dsRol, cdSistema, dsNombre, dsDescripcion, icBorrado)
        VALUES (@dsRol, @cdSistema, @dsNombre, @dsDescripcion, @icBorrado);

        SELECT @cdRol = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.ADM_Roles
        SET dsRol = @dsRol,
            cdSistema = @cdSistema,
            dsNombre = @dsNombre,
            dsDescripcion = @dsDescripcion,
            icBorrado = @icBorrado
        WHERE cdRol = @cdRol;
    END

    SELECT @cdRol AS id FOR JSON PATH;
END
GO
