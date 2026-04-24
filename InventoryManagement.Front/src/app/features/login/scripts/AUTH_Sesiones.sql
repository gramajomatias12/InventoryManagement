USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.AUTH_Sesiones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AUTH_Sesiones
    (
        cdSesion INT IDENTITY(1,1) NOT NULL,
        uiSesion UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_AUTH_Sesiones_uiSesion DEFAULT NEWID(),
        cdUsuario INT NOT NULL,
        cdSistema INT NOT NULL,
        cdUserAgent INT NULL,
        dsIP NVARCHAR(64) NULL,
        dsSesionCliente NVARCHAR(200) NULL,
        dsModulo NVARCHAR(20) NULL,
        dtInicio DATETIME2(3) NOT NULL CONSTRAINT DF_AUTH_Sesiones_dtInicio DEFAULT SYSUTCDATETIME(),
        dtUltimoAcceso DATETIME2(3) NOT NULL CONSTRAINT DF_AUTH_Sesiones_dtUltimoAcceso DEFAULT SYSUTCDATETIME(),
        dtExpiracion DATETIME2(3) NULL,
        dtCierre DATETIME2(3) NULL,
        icActiva BIT NOT NULL CONSTRAINT DF_AUTH_Sesiones_icActiva DEFAULT (1),
        dsMotivoCierre NVARCHAR(200) NULL,
        CONSTRAINT PK_AUTH_Sesiones PRIMARY KEY (cdSesion),
        CONSTRAINT UQ_AUTH_Sesiones_uiSesion UNIQUE (uiSesion),
        CONSTRAINT FK_AUTH_Sesiones_Usuarios FOREIGN KEY (cdUsuario) REFERENCES dbo.Usuarios (cdUsuario),
        CONSTRAINT FK_AUTH_Sesiones_SIS_Sistemas FOREIGN KEY (cdSistema) REFERENCES dbo.SIS_Sistemas (cdSistema),
        CONSTRAINT FK_AUTH_Sesiones_AUTH_UserAgent FOREIGN KEY (cdUserAgent) REFERENCES dbo.AUTH_UserAgent (cdUserAgent)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AUTH_Sesiones_cdUsuario'
      AND object_id = OBJECT_ID('dbo.AUTH_Sesiones')
)
BEGIN
    CREATE INDEX IX_AUTH_Sesiones_cdUsuario ON dbo.AUTH_Sesiones (cdUsuario);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AUTH_Sesiones_cdSistema'
      AND object_id = OBJECT_ID('dbo.AUTH_Sesiones')
)
BEGIN
    CREATE INDEX IX_AUTH_Sesiones_cdSistema ON dbo.AUTH_Sesiones (cdSistema);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AUTH_Sesiones_icActiva_dtUltimoAcceso'
      AND object_id = OBJECT_ID('dbo.AUTH_Sesiones')
)
BEGIN
    CREATE INDEX IX_AUTH_Sesiones_icActiva_dtUltimoAcceso
        ON dbo.AUTH_Sesiones (icActiva, dtUltimoAcceso DESC);
END
GO
