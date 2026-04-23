USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT = NULL,
            @cdPerfil INT = NULL,
            @cdSistema INT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdUsuario = cdUsuario,
            @cdPerfil = cdPerfil,
            @cdSistema = cdSistema
        FROM OPENJSON(@jsParametro)
        WITH (
            cdUsuario INT,
            cdPerfil INT,
            cdSistema INT
        );
    END
    ELSE
    BEGIN
        SET @cdUsuario = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            up.cdUsuario,
            u.dsLogin,
            u.dsNombre,
            up.cdPerfil,
            p.dsPerfil,
            p.cdSistema,
            s.dsSistema AS dsSistema,
            up.dsDatos
        FROM dbo.ADM_UsuariosPerfiles up
        INNER JOIN dbo.Usuarios u ON u.cdUsuario = up.cdUsuario
        INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
        INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = p.cdSistema
        WHERE (@cdUsuario IS NULL OR up.cdUsuario = @cdUsuario)
          AND (@cdPerfil IS NULL OR up.cdPerfil = @cdPerfil)
          AND (@cdSistema IS NULL OR p.cdSistema = @cdSistema)
        ORDER BY u.dsLogin, p.dsPerfil
        FOR JSON PATH
    ), '[]') AS items;
END
GO
