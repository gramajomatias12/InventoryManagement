---
name: sp-table-crud
description: "Genera stored procedures SQL Server compatibles con InventoryManagement para una entidad: PREFIJO_Entidad_S y PREFIJO_Entidad_IU (opcional _D). Usar cuando el usuario diga: generar SP de tabla, crear procedures CRUD, generar IU y S, crear SP para entidad. Respeta EntidadController (api/Entidad), formato JSON items y convenciones AUTH/ADM/PAT."
argument-hint: "Modulo, prefijo de sistema, entidad, columnas, filtros, FKs y si requiere control de sesion/rol"
---

# Skill: SP Table CRUD (InventoryManagement)

## Objetivo

Generar scripts de stored procedures para una tabla/entidad del proyecto `InventoryManagement`, alineados con la arquitectura actual:

- API generica en `api/Entidad`
- Resolucion de SP por convención `{Sistema}_{Entidad}_{Operacion}`
- Parametro principal JSON `@jsParametro`
- Respuesta de consultas en formato `items` (`FOR JSON PATH`)

## Cuando usar este skill

- El usuario pide CRUD SQL de una entidad.
- El usuario pide crear `*_S` y `*_IU`.
- El usuario pide SP para un modulo (`administrador`, `patrimonio`, `login`) con prefijo de sistema.

Frases gatillo:

- "generar procedures para esta tabla"
- "crear SP de tabla"
- "generar IU y S"
- "crear procedures CRUD"
- "generar stored procedures"

## Arquitectura de ESTE proyecto

1. `EntidadController` invoca:
   - GET => `{Sistema}_{Entidad}_S`
   - POST => `{Sistema}_{Entidad}_IU`
2. `Sistema` llega por header `Sistema` (default `ADM`)
3. La API siempre envia `@jsParametro`, y agrega `@uiSesion`, `@ip`, `@userAgent` solo si el SP los declara.

Implicacion importante:

- Para que una entidad funcione con la API generica, al menos deben existir `*_S` y `*_IU`.
- `*_D` es opcional y no lo invoca automaticamente `EntidadController`; requiere endpoint/flujo especifico.

## Ubicacion de archivos

Los scripts se guardan en:

- `src/app/features/{modulo}/scripts/{PREFIJO}_{Entidad}_S.sql`
- `src/app/features/{modulo}/scripts/{PREFIJO}_{Entidad}_IU.sql`
- opcional: `src/app/features/{modulo}/scripts/{PREFIJO}_{Entidad}_D.sql`

Modulos frecuentes:

- `administrador` -> prefijo habitual `ADM`
- `patrimonio` -> prefijo habitual `PAT`
- `login` -> prefijos frecuentes `AUTH` (y algunos `ADM`)

## Convenciones de nombre y datos

### SPs

- Select/listado: `{PREFIJO}_{Entidad}_S`
- Insert/Update: `{PREFIJO}_{Entidad}_IU`
- Delete opcional: `{PREFIJO}_{Entidad}_D`

### Columnas (prefijos)

| Prefijo | Uso | Tipo SQL sugerido |
|---|---|---|
| `cd` | PK/FK/codigos | `INT` / `SMALLINT` |
| `ds` | Textos | `NVARCHAR(n)` / `NVARCHAR(MAX)` |
| `dt` | Fechas | `DATE` / `DATETIME` / `DATETIME2(3)` |
| `ic` | Booleanos | `BIT` |
| `vl` | Valores numericos | `INT` / `DECIMAL` / `FLOAT` |
| `ui` | Identificador unico | `UNIQUEIDENTIFIER` |
| `js` | JSON | `NVARCHAR(MAX)` |

## Firma de parametros recomendada

### Base minima (si no requiere sesion)

```sql
@jsParametro NVARCHAR(MAX) = NULL
```

### Completa (recomendada para modulos protegidos)

```sql
@jsParametro NVARCHAR(MAX) = NULL,
@ip VARCHAR(20) = NULL,
@userAgent VARCHAR(MAX) = NULL,
@uiSesion VARCHAR(100) = NULL
```

## Plantilla _S (compatible)

```sql
USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[{PREFIJO}_{Entidad}_S]
	@jsParametro NVARCHAR(MAX) = NULL,
	@ip VARCHAR(20) = NULL,
	@userAgent VARCHAR(MAX) = NULL,
	@uiSesion VARCHAR(100) = NULL
AS
BEGIN
	SET NOCOUNT ON;

	-- Bloque de sesion opcional segun criticidad
	-- (si aplica) EXEC AUTH_Sesiones_S ...

	DECLARE @id INT = NULL;

	IF ISJSON(@jsParametro) = 1
	BEGIN
		SELECT @id = id
		FROM OPENJSON(@jsParametro)
		WITH (id INT);
	END
	ELSE
	BEGIN
		SET @id = TRY_CAST(@jsParametro AS INT);
	END;

	SELECT ISNULL((
		SELECT
			t.cdEntidad,
			t.dsNombre,
			t.icActivo
		FROM dbo.{PREFIJO}_{EntidadPlural} t
		WHERE (@id IS NULL OR t.cdEntidad = @id)
		FOR JSON PATH
	), '[]') AS items;
END
GO
```

## Plantilla _IU (compatible)

```sql
USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[{PREFIJO}_{Entidad}_IU]
	@jsParametro NVARCHAR(MAX),
	@ip VARCHAR(20) = NULL,
	@userAgent VARCHAR(MAX) = NULL,
	@uiSesion VARCHAR(100) = NULL
AS
BEGIN
	SET NOCOUNT ON;

	-- Bloque de sesion opcional segun criticidad
	-- (si aplica) EXEC AUTH_Sesiones_S ...

	DECLARE @cdEntidad INT,
			@id INT,
			@dsNombre NVARCHAR(100),
			@icActivo BIT;

	SELECT
		@cdEntidad = cdEntidad,
		@id = id,
		@dsNombre = dsNombre,
		@icActivo = icActivo
	FROM OPENJSON(@jsParametro)
	WITH (
		cdEntidad INT,
		id INT,
		dsNombre NVARCHAR(100),
		icActivo BIT
	);

	SET @cdEntidad = COALESCE(@cdEntidad, @id);
	SET @icActivo = ISNULL(@icActivo, 1);

	IF @cdEntidad IS NULL OR @cdEntidad = 0
	BEGIN
		INSERT INTO dbo.{PREFIJO}_{EntidadPlural} (dsNombre, icActivo)
		VALUES (@dsNombre, @icActivo);

		SELECT @cdEntidad = SCOPE_IDENTITY();
	END
	ELSE
	BEGIN
		UPDATE dbo.{PREFIJO}_{EntidadPlural}
		SET dsNombre = @dsNombre,
			icActivo = @icActivo
		WHERE cdEntidad = @cdEntidad;
	END;

	SELECT @cdEntidad AS id FOR JSON PATH;
END
GO
```

## Bloque de control de sesion/rol (cuando corresponda)

Para entidades sensibles (ej. `ADM_*`, mantenimiento de seguridad), incluir este patron:

1. `DECLARE @rol VARCHAR(200) = '{PREFIJO}_ADM';`
2. `EXECUTE AUTH_Sesiones_S @uiSesion, @userAgent, @ip, @procId, @jsParametro, @resultado OUTPUT, @rol;`
3. Parsear `@resultado` con `OPENJSON`.
4. Si `@cdSesion IS NULL`: `RAISERROR(@resultado, 16, 2); RETURN;`

Nota: evitar `CFG_sesiones_s` (no es el patron vigente de este repo).

## Reglas de salida obligatorias

1. En `_S`, devolver siempre:

```sql
SELECT ISNULL(( ... FOR JSON PATH ), '[]') AS items;
```

2. En `_IU`, devolver siempre:

```sql
SELECT @idGenerado AS id FOR JSON PATH;
```

3. Usar `CREATE OR ALTER PROCEDURE`.
4. Incluir `USE [DBPrueba]`, `SET ANSI_NULLS ON`, `SET QUOTED_IDENTIFIER ON`.
5. Soportar `id` y `cdEntidad` en JSON para upsert cuando sea posible.

## Convenciones de implementacion

- Tabla usualmente plural (`ADM_Perfiles`) y PK singular (`cdPerfil`).
- En `_S`, permitir filtros opcionales con patron:

```sql
(@param IS NULL OR t.campo = @param)
```

- En joins descriptivos usar alias expresivos (`dsSistema`, `dsPerfil`, etc.).
- Preferir `SCOPE_IDENTITY()` sobre `@@IDENTITY`.

## Datos minimos a pedir al usuario

Si la solicitud llega incompleta, pedir:

1. Modulo destino (`administrador`, `patrimonio`, `login`, otro).
2. Prefijo de sistema (`ADM`, `PAT`, `AUTH`, etc.).
3. Nombre de entidad (sin prefijo).
4. Tabla fisica objetivo y PK.
5. Columnas a exponer/guardar.
6. Filtros del `_S`.
7. Si requiere control de sesion/rol.

## Entregable del skill

Al usar este skill, entregar siempre:

1. Ruta destino de cada archivo.
2. Contenido completo de `{PREFIJO}_{Entidad}_S.sql`.
3. Contenido completo de `{PREFIJO}_{Entidad}_IU.sql`.
4. Opcional `{PREFIJO}_{Entidad}_D.sql` si lo pidieron explicitamente.
5. Mini checklist de compatibilidad con `api/Entidad`.
