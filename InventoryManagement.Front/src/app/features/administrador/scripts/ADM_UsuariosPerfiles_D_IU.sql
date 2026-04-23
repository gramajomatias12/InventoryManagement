USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_UsuariosPerfiles_D_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT,
            @cdPerfil INT;

    SELECT
        @cdUsuario = cdUsuario,
        @cdPerfil = cdPerfil
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        cdPerfil INT
    );

    DELETE FROM dbo.ADM_UsuariosPerfiles
    WHERE cdUsuario = @cdUsuario
      AND cdPerfil = @cdPerfil;

    SELECT @cdUsuario AS cdUsuario, @cdPerfil AS cdPerfil FOR JSON PATH;
END
GO
