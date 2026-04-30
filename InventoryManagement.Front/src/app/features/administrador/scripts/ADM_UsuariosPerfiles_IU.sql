USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_IU]
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
            @cdPerfil INT,
            @dsDatos NVARCHAR(MAX),
            @cdSistema INT;

    SELECT
        @cdUsuario = cdUsuario,
        @cdPerfil = cdPerfil,
        @dsDatos = dsDatos
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdPerfil INT,
        dsDatos NVARCHAR(MAX)
    );

    SELECT @cdSistema = p.cdSistema
    FROM dbo.ADM_Perfiles p
    WHERE p.cdPerfil = @cdPerfil;

    IF @cdSistema IS NULL
    BEGIN
        RAISERROR('El perfil indicado no existe.', 16, 2);
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles up
        INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
        WHERE up.cdUsuario = @cdUsuario
          AND p.cdSistema = @cdSistema
          AND up.cdPerfil <> @cdPerfil
    )
    BEGIN
        RAISERROR('El usuario ya tiene un perfil asignado para este sistema.', 16, 2);
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil
    )
    BEGIN
        UPDATE dbo.ADM_UsuariosPerfiles
        SET dsDatos = @dsDatos
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.ADM_UsuariosPerfiles (cdUsuario, cdPerfil, dsDatos)
        VALUES (@cdUsuario, @cdPerfil, @dsDatos);
    END

    SELECT @cdUsuario AS cdUsuario, @cdPerfil AS cdPerfil FOR JSON PATH;
END
GO
