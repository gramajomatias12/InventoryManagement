USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[AUTH_Sesiones_S]
    @uiSesion VARCHAR(100) = NULL,
    @userAgent VARCHAR(MAX) = NULL,
    @ip VARCHAR(20) = NULL,
    @dsProcedimiento VARCHAR(120) = NULL,
    @jsParametro NVARCHAR(MAX) = NULL,
    @resultado VARCHAR(MAX) OUTPUT,
    @rol VARCHAR(200) = NULL,
    @nolog BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @uiSesionGuid UNIQUEIDENTIFIER,
            @cdSesion INT,
            @cdUsuario INT,
            @cdSistema INT,
            @dsLogin NVARCHAR(100),
            @dsPerfil NVARCHAR(100),
            @dsUserAgentSesion NVARCHAR(MAX),
            @dtExpiracion DATETIME2(3),
            @esPublico BIT = 0;

    SET @resultado = NULL;
    SET @uiSesion = NULLIF(LTRIM(RTRIM(@uiSesion)), '');
    SET @userAgent = NULLIF(LTRIM(RTRIM(@userAgent)), '');
    SET @ip = NULLIF(LTRIM(RTRIM(@ip)), '');
    SET @rol = NULLIF(LTRIM(RTRIM(@rol)), '');
    SET @dsProcedimiento = COALESCE(NULLIF(LTRIM(RTRIM(@dsProcedimiento)), ''), 'AUTH_Sesiones_S');

    IF @rol LIKE '%[_]PUBLIC'
    BEGIN
        SET @esPublico = 1;
    END

    IF @uiSesion IS NULL AND @esPublico = 0
    BEGIN
        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'La sesion ha caducado. Debe ingresar nuevamente' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    IF @uiSesion IS NOT NULL
    BEGIN
        SET @uiSesionGuid = TRY_CAST(@uiSesion AS UNIQUEIDENTIFIER);
    END

    IF @uiSesion IS NOT NULL AND @uiSesionGuid IS NULL
    BEGIN
        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'Sesion invalida. Debe ser GUID.' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    SELECT
        @cdSesion = s.cdSesion,
        @cdUsuario = s.cdUsuario,
        @cdSistema = s.cdSistema,
        @dsLogin = u.dsLogin,
        @dtExpiracion = s.dtExpiracion,
        @dsUserAgentSesion = ua.dsUserAgent
    FROM dbo.AUTH_Sesiones s
    INNER JOIN dbo.Usuarios u ON u.cdUsuario = s.cdUsuario
    LEFT JOIN dbo.AUTH_UserAgent ua ON ua.cdUserAgent = s.cdUserAgent
    WHERE s.uiSesion = @uiSesionGuid
      AND s.icActiva = 1
      AND s.dtCierre IS NULL;

    IF @esPublico = 1
    BEGIN
        SET @resultado = (
            SELECT
                'Public' AS dsLogin,
                ISNULL(@cdSesion, -1) AS cdSesion,
                ISNULL(@cdUsuario, -1) AS cdUsuario,
                @cdSistema AS cdSistema
            FOR JSON PATH
        );

        IF (RIGHT(@dsProcedimiento, 2) <> '_S' AND RIGHT(@dsProcedimiento, 5) <> '_SYNC') AND @nolog = 0
        BEGIN
            INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
            VALUES (@cdSesion, @dsProcedimiento, @jsParametro);
        END

        RETURN;
    END

    IF @cdSesion IS NULL
    BEGIN
        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'La sesion ha caducado. Debe ingresar nuevamente' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    IF @dtExpiracion IS NOT NULL AND @dtExpiracion < SYSUTCDATETIME()
    BEGIN
        UPDATE dbo.AUTH_Sesiones
        SET icActiva = 0,
            dtCierre = SYSUTCDATETIME(),
            dsMotivoCierre = 'Expirada por validacion'
        WHERE cdSesion = @cdSesion;

        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'La sesion ha caducado. Debe ingresar nuevamente' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    IF @ip IS NOT NULL AND EXISTS (
        SELECT 1
        FROM dbo.AUTH_Sesiones s
        WHERE s.cdSesion = @cdSesion
          AND NULLIF(LTRIM(RTRIM(s.dsIP)), '') IS NOT NULL
          AND s.dsIP <> @ip
    )
    BEGIN
        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'La sesion no coincide con la IP informada' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    IF @userAgent IS NOT NULL
       AND @dsUserAgentSesion IS NOT NULL
       AND @dsUserAgentSesion <> @userAgent
    BEGIN
        SET @resultado = (
            SELECT 1 AS isException, 1 AS error, 'La sesion no coincide con el UserAgent informado' AS mensaje
            FOR JSON PATH
        );
        RETURN;
    END

    IF @rol IS NOT NULL
    BEGIN
        DECLARE @rolesRequeridos TABLE (rol NVARCHAR(200) PRIMARY KEY);

        INSERT INTO @rolesRequeridos(rol)
        SELECT DISTINCT UPPER(LTRIM(RTRIM(value)))
        FROM STRING_SPLIT(REPLACE(REPLACE(@rol, ';', ','), '|', ','), ',')
        WHERE NULLIF(LTRIM(RTRIM(value)), '') IS NOT NULL;

        IF EXISTS (SELECT 1 FROM @rolesRequeridos)
           AND NOT EXISTS
        (
            SELECT 1
            FROM dbo.ADM_UsuariosPerfiles up
            INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
            INNER JOIN dbo.ADM_PerfilesRoles pr ON pr.cdPerfil = p.cdPerfil
            INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr.cdRol
            INNER JOIN @rolesRequeridos rr
                ON rr.rol = UPPER(LTRIM(RTRIM(ISNULL(r.dsRol, ''))))
                OR rr.rol = UPPER(LTRIM(RTRIM(ISNULL(r.dsNombre, ''))))
            WHERE up.cdUsuario = @cdUsuario
              AND p.cdSistema = @cdSistema
              AND p.icBorrado = 0
        )
        BEGIN
            SET @resultado = (
                SELECT 1 AS isException, 2 AS error, 'No dispone de permisos suficientes para esta funcion' AS mensaje
                FOR JSON PATH
            );
            RETURN;
        END
    END

    SELECT TOP 1 @dsPerfil = p.dsPerfil
    FROM dbo.ADM_UsuariosPerfiles up
    INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
    WHERE up.cdUsuario = @cdUsuario
      AND p.cdSistema = @cdSistema
      AND p.icBorrado = 0
    ORDER BY p.dsPerfil;

    UPDATE dbo.AUTH_Sesiones
    SET dtUltimoAcceso = SYSUTCDATETIME()
    WHERE cdSesion = @cdSesion;

    SET @resultado = (
        SELECT
            @cdSesion AS cdSesion,
            @dsLogin AS dsLogin,
            @dsPerfil AS dsPerfil,
            @cdUsuario AS cdUsuario,
            @cdSistema AS cdSistema
        FOR JSON PATH
    );

    IF (RIGHT(@dsProcedimiento, 2) <> '_S' AND RIGHT(@dsProcedimiento, 5) <> '_SYNC') AND @nolog = 0
    BEGIN
        INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
        VALUES
        (
            @cdSesion,
            @dsProcedimiento,
            (
                SELECT
                    @ip AS ip,
                    @userAgent AS userAgent,
                    @rol AS rol,
                    @jsParametro AS jsParametro
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        );
    END
END
GO
