USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_PerfilesRoles_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

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