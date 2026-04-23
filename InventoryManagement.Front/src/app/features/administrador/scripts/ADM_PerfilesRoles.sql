USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.ADM_PerfilesRoles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ADM_PerfilesRoles
    (
        cdPerfil       INT NOT NULL,
        cdRol          INT NOT NULL,

        CONSTRAINT PK_ADM_PerfilesRoles PRIMARY KEY (cdPerfil, cdRol),
        CONSTRAINT FK_ADM_PerfilesRoles_Perfiles FOREIGN KEY (cdPerfil)
            REFERENCES dbo.ADM_Perfiles (cdPerfil),
        CONSTRAINT FK_ADM_PerfilesRoles_Roles FOREIGN KEY (cdRol)
            REFERENCES dbo.ADM_Roles (cdRol)
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_ADM_PerfilesRoles_cdRol'
      AND object_id = OBJECT_ID('dbo.ADM_PerfilesRoles')
)
BEGIN
    CREATE INDEX IX_ADM_PerfilesRoles_cdRol
        ON dbo.ADM_PerfilesRoles (cdRol);
END
GO
