USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.ADM_Perfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ADM_Perfiles
    (
        cdPerfil       INT IDENTITY(1,1) NOT NULL,
        dsPerfil       NVARCHAR(80)      NOT NULL,
        cdSistema      INT               NOT NULL,
        dsDescripcion  NVARCHAR(250)     NULL,
        icBorrado      BIT               NOT NULL CONSTRAINT DF_ADM_Perfiles_icBorrado DEFAULT (0),

        CONSTRAINT PK_ADM_Perfiles PRIMARY KEY (cdPerfil),
        CONSTRAINT FK_ADM_Perfiles_SIS_Sistemas FOREIGN KEY (cdSistema)
            REFERENCES dbo.SIS_Sistemas (cdSistema)
    );
END
GO

IF COL_LENGTH('dbo.ADM_Perfiles', 'dsRoles') IS NOT NULL
BEGIN
    ALTER TABLE dbo.ADM_Perfiles DROP COLUMN dsRoles;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_ADM_Perfiles_cdSistema_dsPerfil'
      AND object_id = OBJECT_ID('dbo.ADM_Perfiles')
)
BEGIN
    CREATE UNIQUE INDEX UX_ADM_Perfiles_cdSistema_dsPerfil
        ON dbo.ADM_Perfiles (cdSistema, dsPerfil);
END
GO
