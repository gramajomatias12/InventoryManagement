USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_PerfilesRoles_S]
    @jsParametro NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdPerfil INT = NULL,
            @cdRol INT = NULL,
            @cdSistema INT = NULL;

    IF ISJSON(@jsParametro) = 1
    BEGIN
        SELECT
            @cdPerfil = cdPerfil,
            @cdRol = cdRol,
            @cdSistema = cdSistema
        FROM OPENJSON(@jsParametro)
        WITH (
            cdPerfil INT,
            cdRol INT,
            cdSistema INT
        );
    END
    ELSE
    BEGIN
        SET @cdPerfil = TRY_CAST(@jsParametro AS INT);
    END

    SELECT ISNULL((
        SELECT
            pr.cdPerfil,
            p.dsPerfil,
            p.cdSistema,
            s.dsSistema AS dsSistema,
            pr.cdRol,
            r.dsRol,
            r.dsNombre AS dsNombreRol
        FROM dbo.ADM_PerfilesRoles pr
        INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = pr.cdPerfil
        INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr.cdRol
        INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = p.cdSistema
        WHERE (@cdPerfil IS NULL OR pr.cdPerfil = @cdPerfil)
          AND (@cdRol IS NULL OR pr.cdRol = @cdRol)
          AND (@cdSistema IS NULL OR p.cdSistema = @cdSistema)
        ORDER BY p.dsPerfil, r.dsRol
        FOR JSON PATH
    ), '[]') AS items;
END
GO
