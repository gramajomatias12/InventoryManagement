USE [DBPrueba]
GO
SET NOCOUNT ON;
GO

/*
  Diagnostico de login por usuario/sistema
  1) Ajusta estos parametros
*/
DECLARE @dsLogin NVARCHAR(50) = 'admin';
DECLARE @cdSistema INT = 1;

/* 2) Estado base del usuario + sistema */
SELECT
    u.cdUsuario,
    u.dsLogin,
    u.icActivo AS usuarioActivo,
    s.cdSistema,
    s.dsSistema,
    s.dsPrefijo,
    s.icBaja AS sistemaBaja
FROM dbo.Usuarios u
CROSS JOIN dbo.SIS_Sistemas s
WHERE u.dsLogin = @dsLogin
  AND s.cdSistema = @cdSistema;

/* 3) Perfiles del usuario en el sistema */
SELECT
    up.cdUsuario,
    up.cdPerfil,
    p.dsPerfil,
    p.cdSistema,
    p.icBorrado AS perfilBorrado,
    up.dsDatos
FROM dbo.ADM_UsuariosPerfiles up
INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil
INNER JOIN dbo.Usuarios u ON u.cdUsuario = up.cdUsuario
WHERE u.dsLogin = @dsLogin
  AND p.cdSistema = @cdSistema
ORDER BY p.dsPerfil;

/* 4) Roles derivados de perfiles en el sistema */
SELECT
    u.cdUsuario,
    p.cdPerfil,
    p.dsPerfil,
    r.cdRol,
    r.dsRol,
    r.dsNombre,
    r.icBorrado AS rolBorrado,
    CASE
        WHEN UPPER(ISNULL(r.dsRol, '')) LIKE '%ADMIN%'
          OR UPPER(ISNULL(r.dsNombre, '')) LIKE '%ADMIN%'
        THEN 1 ELSE 0
    END AS marcaAdmin
FROM dbo.Usuarios u
INNER JOIN dbo.ADM_UsuariosPerfiles up ON up.cdUsuario = u.cdUsuario
INNER JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil AND p.cdSistema = @cdSistema
INNER JOIN dbo.ADM_PerfilesRoles pr ON pr.cdPerfil = p.cdPerfil
INNER JOIN dbo.ADM_Roles r ON r.cdRol = pr.cdRol
WHERE u.dsLogin = @dsLogin
ORDER BY p.dsPerfil, r.dsRol;

/* 5) Resultado esperado del SP Auth_Login (sin password) */
SELECT
    u.cdUsuario,
    u.dsNombre,
    u.dsApellido,
    u.dsLogin,
    u.icActivo,
    s.cdSistema,
    s.dsSistema,
    s.dsPrefijo,
    MIN(p.dsPerfil) AS dsPerfil,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM dbo.ADM_UsuariosPerfiles up2
            INNER JOIN dbo.ADM_Perfiles p2 ON p2.cdPerfil = up2.cdPerfil AND p2.cdSistema = @cdSistema
            INNER JOIN dbo.ADM_PerfilesRoles pr2 ON pr2.cdPerfil = p2.cdPerfil
            INNER JOIN dbo.ADM_Roles r2 ON r2.cdRol = pr2.cdRol
            WHERE up2.cdUsuario = u.cdUsuario
              AND (
                    UPPER(ISNULL(r2.dsRol, '')) LIKE '%ADMIN%'
                 OR UPPER(ISNULL(r2.dsNombre, '')) LIKE '%ADMIN%'
              )
        ) THEN 1 ELSE 0
    END AS isAdminCalculado
FROM dbo.Usuarios u
INNER JOIN dbo.SIS_Sistemas s ON s.cdSistema = @cdSistema
LEFT JOIN dbo.ADM_UsuariosPerfiles up ON up.cdUsuario = u.cdUsuario
LEFT JOIN dbo.ADM_Perfiles p ON p.cdPerfil = up.cdPerfil AND p.cdSistema = @cdSistema
WHERE u.dsLogin = @dsLogin
GROUP BY
    u.cdUsuario,
    u.dsNombre,
    u.dsApellido,
    u.dsLogin,
    u.icActivo,
    s.cdSistema,
    s.dsSistema,
    s.dsPrefijo;
GO
