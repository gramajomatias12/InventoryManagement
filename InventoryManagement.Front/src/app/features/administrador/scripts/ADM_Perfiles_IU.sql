USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Perfiles_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdPerfil INT,
            @id INT,
            @dsPerfil NVARCHAR(80),
            @cdSistema INT,
            @dsDescripcion NVARCHAR(250),
            @dsRoles NVARCHAR(MAX),
            @icBorrado BIT;

    SELECT
        @cdPerfil = cdPerfil,
        @id = id,
        @dsPerfil = dsPerfil,
        @cdSistema = cdSistema,
        @dsDescripcion = dsDescripcion,
        @dsRoles = dsRoles,
        @icBorrado = icBorrado
    FROM OPENJSON(@jsParametro)
    WITH (
        cdPerfil INT,
        id INT,
        dsPerfil NVARCHAR(80),
        cdSistema INT,
        dsDescripcion NVARCHAR(250),
        dsRoles NVARCHAR(MAX),
        icBorrado BIT
    );

    SET @cdPerfil = COALESCE(@cdPerfil, @id);
    SET @icBorrado = ISNULL(@icBorrado, 0);

    IF @cdPerfil IS NULL OR @cdPerfil = 0
    BEGIN
        INSERT INTO dbo.ADM_Perfiles (dsPerfil, cdSistema, dsDescripcion, dsRoles, icBorrado)
        VALUES (@dsPerfil, @cdSistema, @dsDescripcion, @dsRoles, @icBorrado);

        SELECT @cdPerfil = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.ADM_Perfiles
        SET dsPerfil = @dsPerfil,
            cdSistema = @cdSistema,
            dsDescripcion = @dsDescripcion,
            dsRoles = @dsRoles,
            icBorrado = @icBorrado
        WHERE cdPerfil = @cdPerfil;
    END

    SELECT @cdPerfil AS id FOR JSON PATH;
END
GO
