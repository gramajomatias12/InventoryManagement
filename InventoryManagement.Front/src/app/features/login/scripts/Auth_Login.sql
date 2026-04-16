USE [DBPrueba]
GO
/****** Object:  StoredProcedure [dbo].[Auth_Login]    Script Date: 13/04/2026 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[Auth_Login]
    @jsParametro NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @dsLogin NVARCHAR(50),
            @cdSistema INT,
            @idSistema INT;

    -- Extraemos los datos del JSON que manda Angular/.NET
    SELECT
        @dsLogin = dsLogin,
        @cdSistema = cdSistema,
        @idSistema = idSistema
    FROM OPENJSON(@jsParametro)
    WITH (
        dsLogin NVARCHAR(50),
        cdSistema INT,
        idSistema INT
    );

    -- Compatibilidad: el front actual manda idSistema
    SET @cdSistema = ISNULL(@cdSistema, @idSistema);

    -- Si no llega sistema, usamos SIS (cdSistema = 1) como fallback.
    -- Ajustalo si en tu BD el sistema base tiene otro codigo.
    IF @cdSistema IS NULL
        SET @cdSistema = 1;

    SELECT
        u.cdUsuario,
        u.dsNombre,
        u.dsApellido,
        u.dsLogin,
        u.dsContraseña,
        u.cdRol,
        r.dsRol,
        s.cdSistema,
        s.dsSistema,
        s.dsPrefijo
    FROM Usuarios u
    INNER JOIN Roles r ON u.cdRol = r.cdRol
    INNER JOIN SIS_Sistemas s ON s.cdSistema = @cdSistema
    WHERE u.dsLogin = @dsLogin
      AND u.icActivo = 1
      AND s.icBaja = 0
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END
GO
