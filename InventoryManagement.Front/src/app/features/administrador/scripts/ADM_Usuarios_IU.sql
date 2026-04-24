USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Usuarios_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdUsuario INT,
            @dsLogin NVARCHAR(50),
            @dsPassword NVARCHAR(1000),
            @dsNombre NVARCHAR(100),
            @dsApellido NVARCHAR(100),
            @dsEmail NVARCHAR(100),
            @icActivo BIT;

    SELECT
        @cdUsuario = cdUsuario,
        @dsLogin = dsLogin,
        @dsPassword = dsPassword,
        @dsNombre = dsNombre,
        @dsApellido = dsApellido,
        @dsEmail = dsEmail,
        @icActivo = icActivo
    FROM OPENJSON(@jsParametro)
    WITH (
        cdUsuario INT,
        dsLogin NVARCHAR(50),
        dsPassword NVARCHAR(1000),
        dsNombre NVARCHAR(100),
        dsApellido NVARCHAR(100),
        dsEmail NVARCHAR(100),
        icActivo BIT
    );

    IF @cdUsuario IS NULL OR @cdUsuario = 0
    BEGIN
        INSERT INTO dbo.Usuarios (dsLogin, dsContraseña, dsNombre, dsApellido, dsEmail, icActivo, dtCreacion)
        VALUES (@dsLogin, @dsPassword, @dsNombre, @dsApellido, @dsEmail, @icActivo, GETDATE());

        SET @cdUsuario = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.Usuarios
        SET dsLogin = @dsLogin,
            dsContraseña = ISNULL(@dsPassword, dsContraseña),
            dsNombre = @dsNombre,
            dsApellido = @dsApellido,
            dsEmail = @dsEmail,
            icActivo = @icActivo
        WHERE cdUsuario = @cdUsuario;
    END

    SELECT @cdUsuario AS id FOR JSON PATH;
END
GO
