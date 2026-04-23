USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.ADM_Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ADM_Roles
    (
        cdRol          INT IDENTITY(1,1) NOT NULL,
        dsRol          NVARCHAR(50)      NOT NULL,
        cdSistema      INT               NOT NULL,
        dsNombre       NVARCHAR(100)     NOT NULL,
        dsDescripcion  NVARCHAR(250)     NULL,
        icBorrado      BIT               NOT NULL CONSTRAINT DF_ADM_Roles_icBorrado DEFAULT (0),

        CONSTRAINT PK_ADM_Roles PRIMARY KEY (cdRol),
        CONSTRAINT FK_ADM_Roles_SIS_Sistemas FOREIGN KEY (cdSistema)
            REFERENCES dbo.SIS_Sistemas (cdSistema)
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_ADM_Roles_cdSistema_dsRol'
      AND object_id = OBJECT_ID('dbo.ADM_Roles')
)
BEGIN
    CREATE UNIQUE INDEX UX_ADM_Roles_cdSistema_dsRol
        ON dbo.ADM_Roles (cdSistema, dsRol);
END
GO
