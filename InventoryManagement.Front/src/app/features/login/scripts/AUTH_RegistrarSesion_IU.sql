USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[AUTH_RegistrarSesion_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT,
            @cdSistema INT,
            @ip NVARCHAR(64),
            @userAgent NVARCHAR(500),
            @session NVARCHAR(200),
            @modulo NVARCHAR(20),
            @cdUserAgent INT,
            @cdSesion INT,
            @uiSesion UNIQUEIDENTIFIER;

    SELECT
        @cdUsuario = cdUsuario,
        @cdSistema = cdSistema,
        @ip = ip,
        @userAgent = userAgent,
        @session = [session],
        @modulo = modulo
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdSistema INT,
        ip NVARCHAR(64),
        userAgent NVARCHAR(500),
        [session] NVARCHAR(200),
        modulo NVARCHAR(20)
    );

    IF @cdUsuario IS NULL OR @cdSistema IS NULL
    BEGIN
        SELECT 1 AS isException, 1 AS error, 'cdUsuario/cdSistema son obligatorios' AS mensaje
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

    INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
    VALUES
    (
        @cdSesion,
        CONCAT(ISNULL(@modulo, 'AUTH'), ':login.ok'),
        (SELECT @cdUsuario AS cdUsuario, @ip AS ip, @cdUserAgent AS userAgent FOR JSON PATH)
    );

    SELECT
        @cdSesion AS cdSesion,
        CONVERT(NVARCHAR(36), @uiSesion) AS sesion
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END
GO
