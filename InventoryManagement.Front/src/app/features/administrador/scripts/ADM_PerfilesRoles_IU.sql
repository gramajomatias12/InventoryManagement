USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_PerfilesRoles_IU]
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

    DECLARE @cdPerfil INT,
            @cdRol INT;

    SELECT
        @cdPerfil = cdPerfil,
        @cdRol = cdRol
    FROM OPENJSON(@jsParametro)
    WITH (
        cdPerfil INT,
        cdRol INT
    );

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.ADM_PerfilesRoles
        WHERE cdPerfil = @cdPerfil
          AND cdRol = @cdRol
    )
    BEGIN
        INSERT INTO dbo.ADM_PerfilesRoles (cdPerfil, cdRol)
        VALUES (@cdPerfil, @cdRol);
    END

    SELECT @cdPerfil AS cdPerfil, @cdRol AS cdRol FOR JSON PATH;
END
GO