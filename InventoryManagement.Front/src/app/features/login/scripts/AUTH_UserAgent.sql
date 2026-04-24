USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.AUTH_UserAgent', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AUTH_UserAgent
    (
        cdUserAgent INT IDENTITY(1,1) NOT NULL,
        dsUserAgent NVARCHAR(500) NOT NULL,
        dtCreacion DATETIME2(3) NOT NULL CONSTRAINT DF_AUTH_UserAgent_dtCreacion DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_AUTH_UserAgent PRIMARY KEY (cdUserAgent)
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_AUTH_UserAgent_dsUserAgent'
      AND object_id = OBJECT_ID('dbo.AUTH_UserAgent')
)
BEGIN
    CREATE UNIQUE INDEX UX_AUTH_UserAgent_dsUserAgent
        ON dbo.AUTH_UserAgent (dsUserAgent);
END
GO
