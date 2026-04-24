USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[AUTH_LogAcceso_IU]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cdLog INT,
            @cdSesion INT,
            @dsProcedimiento NVARCHAR(120),
            @dsDocumento NVARCHAR(MAX);

    SELECT
        @cdSesion = cdSesion,
        @dsProcedimiento = dsProcedimiento,
        @dsDocumento = dsDocumento
    FROM OPENJSON(@jsParametro)
    WITH (
        cdSesion INT,
        dsProcedimiento NVARCHAR(120),
        dsDocumento NVARCHAR(MAX)
    );

    INSERT INTO dbo.AUTH_LogAcceso (cdSesion, dsProcedimiento, dsDocumento)
    VALUES (@cdSesion, ISNULL(@dsProcedimiento, 'AUTH:log'), @dsDocumento);

    SET @cdLog = SCOPE_IDENTITY();

    SELECT @cdLog AS id FOR JSON PATH;
END
GO
