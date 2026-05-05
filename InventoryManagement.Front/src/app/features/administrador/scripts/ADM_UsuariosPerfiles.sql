USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.ADM_UsuariosPerfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ADM_UsuariosPerfiles
    (
        cdUsuario      INT            NOT NULL,
        cdPerfil       INT            NOT NULL,
        dsDatos        NVARCHAR(MAX)  NULL,

        CONSTRAINT PK_ADM_UsuariosPerfiles PRIMARY KEY (cdUsuario, cdPerfil),
        CONSTRAINT FK_ADM_UsuariosPerfiles_Usuarios FOREIGN KEY (cdUsuario)
            REFERENCES dbo.ADM_Usuarios (cdUsuario),
        CONSTRAINT FK_ADM_UsuariosPerfiles_Perfiles FOREIGN KEY (cdPerfil)
            REFERENCES dbo.ADM_Perfiles (cdPerfil)
    );
END

-- Corrige FK si ya existía apuntando a la tabla vieja dbo.Usuarios
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_ADM_UsuariosPerfiles_Usuarios'
      AND parent_object_id = OBJECT_ID('dbo.ADM_UsuariosPerfiles')
)
BEGIN
    ALTER TABLE dbo.ADM_UsuariosPerfiles
        DROP CONSTRAINT FK_ADM_UsuariosPerfiles_Usuarios;
END

ALTER TABLE dbo.ADM_UsuariosPerfiles
    ADD CONSTRAINT FK_ADM_UsuariosPerfiles_Usuarios
    FOREIGN KEY (cdUsuario) REFERENCES dbo.ADM_Usuarios (cdUsuario);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ADM_UsuariosPerfiles_cdPerfil'
      AND object_id = OBJECT_ID('dbo.ADM_UsuariosPerfiles')
)
BEGIN
    CREATE INDEX IX_ADM_UsuariosPerfiles_cdPerfil
        ON dbo.ADM_UsuariosPerfiles (cdPerfil);
END
GO
