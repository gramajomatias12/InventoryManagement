USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_D]
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
            @cdPerfil INT;

    SELECT
        @cdUsuario = cdUsuario,
        @cdPerfil = cdPerfil
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdPerfil INT
    );

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil
    )
    BEGIN
        DELETE FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil;

        SELECT '{"mensaje":"UsuarioPerfil eliminado correctamente"}' AS Respuesta;
    END
    ELSE
    BEGIN
        SELECT '{"mensaje":"No existe la relacion UsuarioPerfil", "error": true}' AS Respuesta;
    END
END
GO
