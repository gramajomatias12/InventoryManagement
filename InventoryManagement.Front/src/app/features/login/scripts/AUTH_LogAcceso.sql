USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.AUTH_LogAcceso', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AUTH_LogAcceso
    (
        cdLog INT IDENTITY(1,1) NOT NULL,
        dtFecha DATETIME2(3) NOT NULL CONSTRAINT DF_AUTH_LogAcceso_dtFecha DEFAULT SYSUTCDATETIME(),
        cdSesion INT NULL,
        dsProcedimiento NVARCHAR(120) NOT NULL,
        dsDocumento NVARCHAR(MAX) NULL,
        CONSTRAINT PK_AUTH_LogAcceso PRIMARY KEY (cdLog),
        CONSTRAINT FK_AUTH_LogAcceso_AUTH_Sesiones FOREIGN KEY (cdSesion) REFERENCES dbo.AUTH_Sesiones (cdSesion)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AUTH_LogAcceso_cdSesion_dtFecha'
      AND object_id = OBJECT_ID('dbo.AUTH_LogAcceso')
)
BEGIN
    CREATE INDEX IX_AUTH_LogAcceso_cdSesion_dtFecha
        ON dbo.AUTH_LogAcceso (cdSesion, dtFecha DESC);
END
GO
