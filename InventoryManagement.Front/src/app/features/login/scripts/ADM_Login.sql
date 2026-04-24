USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Login]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cuenta NVARCHAR(50),
            @password NVARCHAR(200),
            @ip NVARCHAR(64),
            @userAgent NVARCHAR(500),
            @modulo NVARCHAR(20) = 'ADM',
            @session NVARCHAR(200) = '',
            @cdSistema INT,
            @idSistema INT,
            @cdUsuario INT,
            @cdUserAgent INT,
            @cdSesion INT,
            @uiSesion UNIQUEIDENTIFIER,
            @isAdmin BIT = 0;

    SELECT
        @cuenta = COALESCE(dsLogin, cuenta),
        @password = COALESCE(dsContraseña, password),
        @ip = ip,
        @userAgent = userAgent,
        @modulo = COALESCE(modulo, @modulo),
        @session = COALESCE([session], ''),
        @cdSistema = cdSistema,
        @idSistema = idSistema
    FROM OPENJSON(@jsParametro)
    WITH (
        dsLogin NVARCHAR(50),
        cuenta NVARCHAR(50),
        dsContraseña NVARCHAR(200),
        [password] NVARCHAR(200),
        ip NVARCHAR(64),
        userAgent NVARCHAR(500),
        modulo NVARCHAR(20),
        [session] NVARCHAR(200),
        cdSistema INT,
        idSistema INT
    );

    SET @cdSistema = COALESCE(@cdSistema, @idSistema);

    IF @cdSistema IS NULL
    BEGIN
        SELECT @cdSistema = cdSistema
        FROM dbo.SIS_Sistemas
        WHERE dsPrefijo = @modulo;
    END

    IF @cdSistema IS NULL
    BEGIN
        INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
        VALUES (NULL, CONCAT(@modulo, ':login'), (SELECT @cuenta AS usuario, @ip AS ip, @userAgent AS userAgent, 'Sistema inválido' AS detalle FOR JSON PATH));

        SELECT 1 AS isException, 1 AS error, 'No se pudo resolver el sistema del login.' AS mensaje
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        RETURN;
    END

    SELECT TOP 1 @cdUsuario = u.cdUsuario
    FROM dbo.Usuarios u
    INNER JOIN dbo.ADM_UsuariosPerfiles up ON up.cdUsuario = u.cdUsuario
    INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
    WHERE u.dsLogin = @cuenta
      AND u.icActivo = 1
      AND p.cdSistema = @cdSistema
      AND p.icBorrado = 0;

    IF @cdUsuario IS NULL
    BEGIN
        INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
        VALUES (NULL, CONCAT(@modulo, ':login'), (SELECT @cuenta AS usuario, @ip AS ip, @userAgent AS userAgent, 'Usuario sin acceso al sistema' AS detalle FOR JSON PATH));

        SELECT 1 AS isException, 1 AS error, 'El usuario no existe o no tiene acceso al sistema ' + @modulo AS mensaje
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        RETURN;
    END

    IF NULLIF(LTRIM(RTRIM(@userAgent)), '') IS NOT NULL
    BEGIN
        SELECT @cdUserAgent = cdUserAgent
        FROM dbo.AUTH_UserAgent
        WHERE dsUserAgent = @userAgent;

        IF @cdUserAgent IS NULL
        BEGIN
            INSERT INTO dbo.AUTH_UserAgent (dsUserAgent)
            VALUES (@userAgent);

            SET @cdUserAgent = SCOPE_IDENTITY();
        END
    END

    INSERT INTO dbo.AUTH_Sesiones
    (
        cdUsuario,
        cdSistema,
        cdUserAgent,
        dsIP,
        dsSesionCliente,
        dsModulo,
        dtInicio,
        dtUltimoAcceso,
        icActiva
    )
    VALUES
    (
        @cdUsuario,
        @cdSistema,
        @cdUserAgent,
        @ip,
        NULLIF(@session, ''),
        @modulo,
        SYSUTCDATETIME(),
        SYSUTCDATETIME(),
        1
    );

    SET @cdSesion = SCOPE_IDENTITY();

    SELECT @uiSesion = uiSesion
    FROM dbo.AUTH_Sesiones
    WHERE cdSesion = @cdSesion;

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles up
        INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil AND p.cdSistema = @cdSistema
        INNER JOIN dbo.ADM_PerfilesRoles pr ON pr.cdPerfil = p.cdPerfil
        INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr.cdRol
        WHERE up.cdUsuario = @cdUsuario
          AND (
                UPPER(ISNULL(r.dsRol, '')) LIKE '%ADMIN%'
             OR UPPER(ISNULL(r.dsNombre, '')) LIKE '%ADMIN%'
          )
    )
    BEGIN
        SET @isAdmin = 1;
    END

    SELECT
        CONVERT(NVARCHAR(36), @uiSesion) AS sesion,
        u.cdUsuario AS usuario,
        u.cdUsuario AS cdUsuario,
        u.dsNombre AS nombre,
        u.dsNombre,
        u.dsApellido AS apellido,
        u.dsApellido,
        u.dsLogin AS login,
        u.dsLogin,
        u.dsEmail AS email,
        u.dsEmail,
        u.dsContraseña,
        @cdSistema AS cdSistema,
        s.dsSistema,
        s.dsPrefijo,
        @isAdmin AS isAdmin,
        (
            SELECT TOP 1 p.dsPerfil
            FROM dbo.ADM_UsuariosPerfiles up
            INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
            WHERE up.cdUsuario = u.cdUsuario
              AND p.cdSistema = @cdSistema
              AND p.icBorrado = 0
            ORDER BY p.dsPerfil
        ) AS dsPerfil,
        JSON_QUERY((
            SELECT p.cdPerfil AS id,
                   p.dsPerfil AS nombre
            FROM dbo.ADM_UsuariosPerfiles up
            INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
            WHERE up.cdUsuario = u.cdUsuario
              AND p.cdSistema = @cdSistema
              AND p.icBorrado = 0
            ORDER BY p.dsPerfil
            FOR JSON PATH
        )) AS perfiles,
        JSON_QUERY((
            SELECT DISTINCT s2.dsPrefijo AS prefijo,
                            s2.dsSistema AS nombre,
                            s2.cdSistema AS id
            FROM dbo.ADM_UsuariosPerfiles up2
            INNER JOIN dbo.ADM_Perfiles p2 ON p2.cdPerfil = up2.cdPerfil
            INNER JOIN dbo.SIS_Sistemas s2 ON s2.cdSistema = p2.cdSistema
            WHERE up2.cdUsuario = u.cdUsuario
              AND p2.icBorrado = 0
              AND s2.icBaja = 0
              AND s2.cdSistema <> @cdSistema
            FOR JSON PATH
        )) AS sistemas,
        JSON_QUERY((
            SELECT DISTINCT r.dsRol AS rol
            FROM dbo.ADM_UsuariosPerfiles up3
            INNER JOIN dbo.ADM_Perfiles p3 ON p3.cdPerfil = up3.cdPerfil
            INNER JOIN dbo.ADM_PerfilesRoles pr3 ON pr3.cdPerfil = p3.cdPerfil
            INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr3.cdRol
            WHERE up3.cdUsuario = u.cdUsuario
              AND p3.cdSistema = @cdSistema
            FOR JSON PATH
        )) AS roles,
        u.icActivo AS estado
    FROM dbo.Usuarios u
    INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = @cdSistema
    WHERE u.cdUsuario = @cdUsuario
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
    VALUES (@cdSesion, CONCAT(@modulo, ':login'), (SELECT @cuenta AS usuario, @ip AS ip, @cdUserAgent AS userAgent FOR JSON PATH));
END
GO
