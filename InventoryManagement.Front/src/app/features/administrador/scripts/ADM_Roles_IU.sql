USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[ADM_Roles_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdRol INT,
            @id INT,
            @dsRol NVARCHAR(50),
            @cdSistema INT,
            @dsNombre NVARCHAR(100),
            @dsDescripcion NVARCHAR(250),
            @icBorrado BIT;

    SELECT
        @cdRol = cdRol,
        @id = id,
        @dsRol = dsRol,
        @cdSistema = cdSistema,
        @dsNombre = dsNombre,
        @dsDescripcion = dsDescripcion,
        @icBorrado = icBorrado
    FROM OPENJSON(@jsParametro)
    WITH (
        cdRol INT,
        id INT,
        dsRol NVARCHAR(50),
        cdSistema INT,
        dsNombre NVARCHAR(100),
        dsDescripcion NVARCHAR(250),
        icBorrado BIT
    );

    SET @cdRol = COALESCE(@cdRol, @id);
    SET @icBorrado = ISNULL(@icBorrado, 0);

    IF @cdRol IS NULL OR @cdRol = 0
    BEGIN
        INSERT INTO dbo.ADM_Roles (dsRol, cdSistema, dsNombre, dsDescripcion, icBorrado)
        VALUES (@dsRol, @cdSistema, @dsNombre, @dsDescripcion, @icBorrado);

        SELECT @cdRol = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.ADM_Roles
        SET dsRol = @dsRol,
            cdSistema = @cdSistema,
            dsNombre = @dsNombre,
            dsDescripcion = @dsDescripcion,
            icBorrado = @icBorrado
        WHERE cdRol = @cdRol;
    END

    SELECT @cdRol AS id FOR JSON PATH;
END
GO
