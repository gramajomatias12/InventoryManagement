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

    DECLARE @dsLogin  NVARCHAR(50),
            @cdSistema INT,
            @idSistema INT;

    SELECT
        @dsLogin   = dsLogin,
        @cdSistema = cdSistema,
        @idSistema = idSistema
    FROM OPENJSON(@jsParametro)
    WITH (
        dsLogin    NVARCHAR(50),
        cdSistema  INT,
        idSistema  INT
    );

    -- Compatibilidad: acepta cdSistema o idSistema
    SET @cdSistema = ISNULL(@cdSistema, @idSistema);

    -- Fallback al sistema base si no llega ninguno
    IF @cdSistema IS NULL
        SET @cdSistema = 1;

    -- Determina si el usuario tiene algun rol de administrador en el sistema solicitado
    DECLARE @isAdmin BIT = 0;

    IF EXISTS (
        SELECT 1
        FROM Usuarios u
        INNER JOIN ADM_UsuariosPerfiles up ON up.cdUsuario = u.cdUsuario
        INNER JOIN ADM_Perfiles p          ON p.cdPerfil  = up.cdPerfil AND p.cdSistema = @cdSistema
        INNER JOIN ADM_PerfilesRoles pr    ON pr.cdPerfil = p.cdPerfil
        INNER JOIN ADM_Roles r             ON r.cdRol     = pr.cdRol
        WHERE u.dsLogin  = @dsLogin
          AND u.icActivo = 1
          AND (
                UPPER(r.dsRol)     LIKE '%ADMIN%'
             OR UPPER(r.dsNombre)  LIKE '%ADMIN%'
          )
    )
        SET @isAdmin = 1;

    -- Devuelve datos del usuario + sistema + flag de admin
    -- El JOIN a ADM_UsuariosPerfiles/Perfiles es opcional (LEFT JOIN)
    -- para que el login funcione aunque el usuario no tenga perfiles asignados todavia
    SELECT
        u.cdUsuario,
        u.dsNombre,
        u.dsApellido,
        u.dsLogin,
        u.dsContraseña,
        @isAdmin       AS isAdmin,
        s.cdSistema,
        s.dsSistema,
        s.dsPrefijo,
        -- Primer perfil del usuario en el sistema (referencial, puede ser NULL)
        MIN(p.dsPerfil) AS dsPerfil
    FROM Usuarios u
    INNER JOIN SIS_Sistemas s              ON s.cdSistema = @cdSistema
    LEFT  JOIN ADM_UsuariosPerfiles up     ON up.cdUsuario = u.cdUsuario
    LEFT  JOIN ADM_Perfiles p              ON p.cdPerfil   = up.cdPerfil
                                          AND p.cdSistema  = @cdSistema
    WHERE u.dsLogin  = @dsLogin
      AND u.icActivo = 1
      AND s.icBaja   = 0
    GROUP BY
        u.cdUsuario,
        u.dsNombre,
        u.dsApellido,
        u.dsLogin,
        u.dsContraseña,
        s.cdSistema,
        s.dsSistema,
        s.dsPrefijo
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
END
GO
