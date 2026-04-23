USE [DBPrueba]
GO
/****** Objeto: StoredProcedure [dbo].[SIS_Usuarios_IU] Fecha de script: 20/04/2026 10:23:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SIS_Usuarios_IU]
    @jsParametro NVARCHAR(MAX) -- Único parámetro que recibe el JSON desde Angular/C#
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Declaramos variables para extraer los datos del JSON
    DECLARE @cdUsuario INT, 
            @dsLogin NVARCHAR(50), 
            @dsPassword NVARCHAR(1000), 
            @dsNombre NVARCHAR(100), 
            @dsApellido NVARCHAR(100), 
            @dsEmail NVARCHAR(100), 
            @icActivo BIT;

    -- 2. "Mapeamos" los valores del JSON a las variables
    -- IMPORTANTE: Los nombres aquí deben ser IGUALES a los del formGroup de Angular
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

    -- 3. Lógica de Inserción o Actualización
    IF @cdUsuario IS NULL OR @cdUsuario = 0
    BEGIN
        -- INSERTAR NUEVO USUARIO
        INSERT INTO Usuarios (dsLogin, dsContraseña, dsNombre, dsApellido, dsEmail, icActivo, dtCreacion)
        VALUES (@dsLogin, @dsPassword, @dsNombre, @dsApellido, @dsEmail, @icActivo, GETDATE());
        
        SELECT @cdUsuario=@@IDENTITY
    END
    ELSE
    BEGIN
        -- ACTUALIZAR USUARIO EXISTENTE
        UPDATE Usuarios
        SET dsLogin = @dsLogin,
            dsContraseña = ISNULL(@dsPassword, dsContraseña),
            dsNombre = @dsNombre,
            dsApellido = @dsApellido,
            dsEmail = @dsEmail,
            icActivo = @icActivo
        WHERE cdUsuario = @cdUsuario;

        select @cdUsuario as id for json path
    END
END