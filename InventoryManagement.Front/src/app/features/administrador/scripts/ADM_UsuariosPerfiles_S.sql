USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_S]
    @jsParametro NVARCHAR(MAX) = NULL,
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

    DECLARE @cdUsuario INT = NULL,
            @cdPerfil INT = NULL,
            @cdSistema INT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdUsuario = cdUsuario,
            @cdPerfil = cdPerfil,
            @cdSistema = cdSistema
        FROM OPENJSON(@jsParametro)
        WITH (
            cdUsuario INT,
            cdPerfil INT,
            cdSistema INT
        );
    END
    ELSE
    BEGIN
        SET @cdUsuario = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            up.cdUsuario,
            u.dsLogin,
            u.dsNombre,
            up.cdPerfil,
            p.dsPerfil,
            p.cdSistema,
            s.dsSistema AS dsSistema,
            up.dsDatos
        FROM dbo.ADM_UsuariosPerfiles up
        INNER JOIN dbo.Usuarios u ON u.cdUsuario = up.cdUsuario
        INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
        INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = p.cdSistema
        WHERE (@cdUsuario IS NULL OR up.cdUsuario = @cdUsuario)
          AND (@cdPerfil IS NULL OR up.cdPerfil = @cdPerfil)
          AND (@cdSistema IS NULL OR p.cdSistema = @cdSistema)
        ORDER BY u.dsLogin, p.dsPerfil
        FOR JSON PATH
    ), '[]') AS items;
END
GO
