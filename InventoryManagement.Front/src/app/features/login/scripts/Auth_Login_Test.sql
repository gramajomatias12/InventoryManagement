USE [DBPrueba]
GO
SET NOCOUNT ON;
GO

/*
  Test directo del SP Auth_Login
  Ajusta dsLogin y cdSistema
*/
DECLARE @payload NVARCHAR(MAX) = N'{
  "dsLogin": "admin",
  "cdSistema": 1
}';

EXEC dbo.Auth_Login @jsParametro = @payload;
GO
