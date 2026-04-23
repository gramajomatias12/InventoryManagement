USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT,
            @cdPerfil INT,
            @dsDatos NVARCHAR(MAX);

    SELECT
        @cdUsuario = cdUsuario,
        @cdPerfil = cdPerfil,
        @dsDatos = dsDatos
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdPerfil INT,
        dsDatos NVARCHAR(MAX)
    );

    IF EXISTS (
        SELECT 1
        FROM dbo.ADM_UsuariosPerfiles
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil
    )
    BEGIN
        UPDATE dbo.ADM_UsuariosPerfiles
        SET dsDatos = @dsDatos
        WHERE cdUsuario = @cdUsuario
          AND cdPerfil = @cdPerfil;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.ADM_UsuariosPerfiles (cdUsuario, cdPerfil, dsDatos)
        VALUES (@cdUsuario, @cdPerfil, @dsDatos);
    END

    SELECT @cdUsuario AS cdUsuario, @cdPerfil AS cdPerfil FOR JSON PATH;
END
GO
