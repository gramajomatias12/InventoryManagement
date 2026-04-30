USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Sistemas_S]
    @jsParametro NVARCHAR(MAX) = NULL,
    @ip VARCHAR(20) = NULL,
    @userAgent VARCHAR(MAX) = NULL,
    @uiSesion VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @rol VARCHAR(200) = 'ADM_PUBLIC';
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

    DECLARE @cdSistema INT = NULL,
            @soloActivos BIT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdSistema = COALESCE(cdSistema, idSistema),
            @soloActivos = soloActivos
        FROM OPENJSON(@jsParametro)
        WITH (
            cdSistema INT,
            idSistema INT,
            soloActivos BIT
        );
    END
    ELSE
    BEGIN
        SET @cdSistema = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            s.cdSistema AS id,
            s.dsSistema AS descripcion,
            s.dsPrefijo AS prefijo,
            s.icBaja AS icBaja,
            JSON_QUERY(ISNULL((
                SELECT
                    p.cdPerfil,
                    p.dsPerfil,
                    p.cdSistema,
                    p.dsDescripcion,
                    p.icBorrado,
                    JSON_QUERY(ISNULL((
                        SELECT
                            r.cdRol,
                            r.dsRol,
                            r.cdSistema,
                            r.dsNombre,
                            r.dsDescripcion,
                            r.icBorrado
                        FROM dbo.ADM_PerfilesRoles pr
                        INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr.cdRol
                        WHERE pr.cdPerfil = p.cdPerfil
                          AND r.cdSistema = p.cdSistema
                          AND UPPER(r.dsRol) LIKE UPPER(s.dsPrefijo) + '_%'
                        ORDER BY r.dsNombre
                        FOR JSON PATH
                    ), '[]')) AS roles
                FROM dbo.ADM_Perfiles p
                WHERE p.cdSistema = s.cdSistema
                  AND UPPER(p.dsPerfil) LIKE UPPER(s.dsPrefijo) + '_%'
                ORDER BY p.dsPerfil
                FOR JSON PATH
            ), '[]')) AS perfiles,
            JSON_QUERY(ISNULL((
                SELECT
                    r.cdRol,
                    r.dsRol,
                    r.cdSistema,
                    r.dsNombre,
                    r.dsDescripcion,
                    r.icBorrado
                FROM dbo.ADM_Roles r
                WHERE r.cdSistema = s.cdSistema
                  AND UPPER(r.dsRol) LIKE UPPER(s.dsPrefijo) + '_%'
                ORDER BY r.dsNombre
                FOR JSON PATH
            ), '[]')) AS roles
        FROM dbo.SIS_Sistemas s
        WHERE (@cdSistema IS NULL OR s.cdSistema = @cdSistema)
          AND (@soloActivos IS NULL OR @soloActivos = 0 OR s.icBaja = 0)
        ORDER BY s.dsSistema
        FOR JSON PATH
    ), '[]') AS items;
END
GO
