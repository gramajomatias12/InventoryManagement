USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[AUTH_CerrarSesion_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @uiSesion UNIQUEIDENTIFIER,
            @dsMotivo NVARCHAR(100),
            @cdSesion  INT;

    SELECT
        @uiSesion = TRY_CAST(sesion AS UNIQUEIDENTIFIER),
        @dsMotivo = ISNULL(motivo, 'logout')
    FROM OPENJSON(@jsParametro)
    WITH (
        sesion   NVARCHAR(36),
        motivo   NVARCHAR(100)
    );

    IF @uiSesion IS NULL
    BEGIN
        SELECT 1 AS isException, 1 AS error, 'El campo sesion es obligatorio y debe ser un GUID valido' AS mensaje
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        RETURN;
    END

    SELECT @cdSesion = cdSesion
    FROM dbo.AUTH_Sesiones
    WHERE uiSesion = @uiSesion;

    IF @cdSesion IS NULL
    BEGIN
        SELECT 1 AS isException, 1 AS error, 'Sesion no encontrada' AS mensaje
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        RETURN;
    END

    UPDATE dbo.AUTH_Sesiones
    SET icActiva         = 0,
        dtCierre         = SYSUTCDATETIME(),
        dsMotivoCierre   = @dsMotivo
    WHERE cdSesion = @cdSesion;

    INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
    VALUES (
        @cdSesion,
        'AUTH:logout',
        (SELECT @dsMotivo AS motivo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );

    SELECT 0 AS isException, @cdSesion AS cdSesion, 'Sesion cerrada correctamente' AS mensaje
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END
GO
