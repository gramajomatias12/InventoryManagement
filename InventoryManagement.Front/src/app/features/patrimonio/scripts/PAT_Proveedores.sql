USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.PAT_Proveedores', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PAT_Proveedores
    (
        cdProveedor       INT IDENTITY(1,1) NOT NULL,
        dsProveedor       NVARCHAR(100)     NOT NULL,
        dsDireccion       NVARCHAR(200)     NULL,
        dsTelefono        NVARCHAR(20)      NULL,
        dsEmail           NVARCHAR(100)     NULL,
        icActivo          BIT               NOT NULL CONSTRAINT DF_PAT_Proveedores_icActivo DEFAULT (1),

        CONSTRAINT PK_PAT_Proveedores PRIMARY KEY (cdProveedor)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_PAT_Proveedores_dsProveedor'
      AND object_id = OBJECT_ID('dbo.PAT_Proveedores')
)
BEGIN
    CREATE INDEX IX_PAT_Proveedores_dsProveedor
        ON dbo.PAT_Proveedores (dsProveedor);
END
GO
