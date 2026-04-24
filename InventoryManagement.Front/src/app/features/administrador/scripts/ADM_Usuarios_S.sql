USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Usuarios_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT @cdUsuario = cdUsuario
        FROM OPENJSON(@jsParametro)
        WITH (cdUsuario INT);
    END
    ELSE
    BEGIN
        SET @cdUsuario = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            u.cdUsuario,
            u.dsLogin,
            u.dsContraseña,
            u.dsNombre,
            u.dsApellido,
            u.dsEmail,
            u.icActivo,
            u.dtCreacion
        FROM dbo.Usuarios u
        WHERE (@cdUsuario IS NULL OR u.cdUsuario = @cdUsuario)
        ORDER BY u.dtCreacion DESC
        FOR JSON PATH
    ), '[]') AS items;
END
GO
