USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Usuarios_IU]
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
    DECLARE @dsLoginSesion VARCHAR(100);
    DECLARE @cdUsuarioSesion INT;
    DECLARE @dsPerfilSesion VARCHAR(100);

    SET @procId = OBJECT_NAME(@@PROCID);

    EXECUTE AUTH_Sesiones_S @uiSesion, @userAgent, @ip, @procId, @jsParametro, @resultado OUTPUT, @rol;

    SELECT
        @cdSesion = cdSesion,
        @dsLoginSesion = dsLogin,
        @dsPerfilSesion = dsPerfil,
        @cdUsuarioSesion = cdUsuario
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

    DECLARE @cdUsuario INT,
            @dsLogin NVARCHAR(50),
            @dsPassword NVARCHAR(1000),
            @dsNombre NVARCHAR(100),
            @dsApellido NVARCHAR(100),
            @dsEmail NVARCHAR(100),
            @icActivo BIT;

    SELECT
        @cdUsuario = cdUsuario,
        @dsLogin = dsLogin,
        @dsPassword = dsPassword,
        @dsNombre = dsNombre,
        @dsApellido = dsApellido,
        @dsEmail = dsEmail,
        @icActivo = icActivo
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        dsLogin NVARCHAR(50),
        dsPassword NVARCHAR(1000),
        dsNombre NVARCHAR(100),
        dsApellido NVARCHAR(100),
        dsEmail NVARCHAR(100),
        icActivo BIT
    );

    IF @cdUsuario IS NULL OR @cdUsuario = 0
    BEGIN
        INSERT INTO dbo.Usuarios (dsLogin, dsContraseña, dsNombre, dsApellido, dsEmail, icActivo, dtCreacion)
        VALUES (@dsLogin, @dsPassword, @dsNombre, @dsApellido, @dsEmail, @icActivo, GETDATE());

        SET @cdUsuario = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.Usuarios
        SET dsLogin = @dsLogin,
            dsContraseña = ISNULL(@dsPassword, dsContraseña),
            dsNombre = @dsNombre,
            dsApellido = @dsApellido,
            dsEmail = @dsEmail,
            icActivo = @icActivo
        WHERE cdUsuario = @cdUsuario;
    END

    SELECT @cdUsuario AS id FOR JSON PATH;
END
GO
