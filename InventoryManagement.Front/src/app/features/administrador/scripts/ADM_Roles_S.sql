USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Roles_S]
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

    DECLARE @cdRol INT = NULL,
            @cdSistema INT = NULL,
            @soloActivos BIT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdRol = cdRol,
            @cdSistema = cdSistema,
            @soloActivos = soloActivos
        FROM OPENJSON(@jsParametro)
        WITH (
            cdRol INT,
            cdSistema INT,
            soloActivos BIT
        );
    END
    ELSE
    BEGIN
        SET @cdRol = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            r.cdRol,
            r.dsRol,
            r.cdSistema,
            s.dsSistema AS dsSistema,
            r.dsNombre,
            r.dsDescripcion,
            r.icBorrado
        FROM dbo.ADM_Roles r
        INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = r.cdSistema
        WHERE (@cdRol IS NULL OR r.cdRol = @cdRol)
          AND (@cdSistema IS NULL OR r.cdSistema = @cdSistema)
          AND (@soloActivos IS NULL OR @soloActivos = 0 OR r.icBorrado = 0)
        ORDER BY r.dsNombre
        FOR JSON PATH
    ), '[]') AS items;
END
GO
