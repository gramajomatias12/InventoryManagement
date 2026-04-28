---
name: sql-table-create
description: "Genera scripts CREATE TABLE SQL Server adaptados a InventoryManagement. Usar cuando el usuario pida: crear tabla, generar CREATE TABLE, nueva tabla SQL, script de tabla. Crea un .sql idempotente con USE [DBPrueba], IF OBJECT_ID, PK, defaults, FKs e indices, en src/app/features/{modulo}/scripts/."
argument-hint: "Modulo (administrador|patrimonio|login u otro), nombre de tabla, columnas, defaults, FKs e indices"
---

# Skill: SQL Table Create (InventoryManagement)

## Objetivo

Generar un script SQL Server para crear una nueva tabla siguiendo las convenciones reales del repositorio `InventoryManagement`.

El resultado debe ser un archivo `.sql` listo para versionar en el frontend, dentro de la carpeta de scripts del modulo.

## Cuando usar este skill

- El usuario pide crear una tabla nueva.
- El usuario pide generar un `CREATE TABLE` con convenciones del proyecto.
- El usuario necesita agregar PK, FKs, defaults e indices para una entidad nueva.

Frases gatillo comunes:

- "crear tabla"
- "generar script de tabla"
- "crear CREATE TABLE"
- "nueva tabla SQL"

## Arquitectura y ubicacion en ESTE proyecto

- Los scripts SQL viven en `InventoryManagement.Front/src/app/features/{modulo}/scripts/`.
- Modulos observados actualmente:
  - `administrador` (prefijo usual `ADM_`)
  - `patrimonio` (prefijo usual `PAT_`)
  - `login` (prefijo usual `AUTH_` y algunos `ADM_`)
- Base de datos usada en scripts existentes: `DBPrueba`.
- Esquema por defecto: `dbo`.

## Convenciones de nombres

### Tabla

- Formato recomendado: `{PREFIJO}_{EntidadPlural}`.
- Ejemplos reales: `ADM_Perfiles`, `PAT_Categorias`, `AUTH_Sesiones`.

### Columnas con prefijos del proyecto

| Prefijo | Significado | Tipo sugerido |
|---------|-------------|---------------|
| `cd` | Codigo / PK / FK | `INT`, `SMALLINT`, `BIGINT` |
| `ds` | Texto / descripcion | `NVARCHAR(n)` o `NVARCHAR(MAX)` |
| `dt` | Fecha/hora | `DATE`, `DATETIME`, `DATETIME2(3)` |
| `ic` | Indicador booleano | `BIT` |
| `vl` | Valor numerico | `INT`, `DECIMAL(p,s)`, `FLOAT` |
| `ui` | Uniqueidentifier | `UNIQUEIDENTIFIER` |
| `js` | JSON | `NVARCHAR(MAX)` |

Reglas practicas:

- PK: `cd{EntidadSingular}` como `INT IDENTITY(1,1) NOT NULL`.
- FKs: `cd{EntidadRelacionada}` con `INT` (`NULL` si opcional).
- Flags: `ic* BIT NOT NULL` con default explicito cuando aplique.
- Texto: preferir siempre `NVARCHAR`.

## Forma del script (idempotente)

El script debe seguir este patron del repo:

```sql
USE [DBPrueba]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.{TABLA}', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.{TABLA}
	(
		{pkColumna} INT IDENTITY(1,1) NOT NULL,
		{columnas...},

		CONSTRAINT PK_{TABLA} PRIMARY KEY ({pkColumna})
		-- CONSTRAINT FK_{TABLA}_{Ref} FOREIGN KEY (...) REFERENCES dbo.{TABLA_REF}(...)
	);
END
GO
```

### Defaults

Si el default se define dentro de `CREATE TABLE`, usar formato:

```sql
icActivo BIT NOT NULL CONSTRAINT DF_{TABLA}_icActivo DEFAULT (1)
```

Valores comunes:

- `icActivo` => `DEFAULT (1)`
- `icBorrado` o `icEliminado` => `DEFAULT (0)`
- `dtCreacion` => `DEFAULT (SYSUTCDATETIME())` o `GETDATE()` segun necesidad funcional
- `ui*` => `DEFAULT NEWID()`

### Foreign keys

Preferencia en este repo: declarar FK dentro del `CREATE TABLE` cuando se conoce la tabla referenciada.

Ejemplo:

```sql
CONSTRAINT FK_AUTH_Sesiones_SIS_Sistemas FOREIGN KEY (cdSistema)
	REFERENCES dbo.SIS_Sistemas (cdSistema)
```

### Indices

Crear indices fuera del `CREATE TABLE` y de forma idempotente:

```sql
IF NOT EXISTS (
	SELECT 1 FROM sys.indexes
	WHERE name = 'IX_{TABLA}_{Columnas}'
	  AND object_id = OBJECT_ID('dbo.{TABLA}')
)
BEGIN
	CREATE INDEX IX_{TABLA}_{Columnas}
		ON dbo.{TABLA} ({Columnas});
END
GO
```

## Orden recomendado de columnas

1. PK primero.
2. FKs despues de PK.
3. Campos descriptivos (`ds*`).
4. Fechas (`dt*`).
5. Indicadores (`ic*`) y auditoria.

## Contrato de salida del skill

Cuando se use este skill, devolver:

1. Ruta destino propuesta del archivo.
2. Script SQL completo.
3. Breve checklist de validacion (PK, FKs, defaults, indices).

Ruta destino:

- `src/app/features/{modulo}/scripts/{TABLA}.sql`

Ejemplo:

- `src/app/features/administrador/scripts/ADM_TiposDocumento.sql`

## Datos minimos a pedir si faltan

Si el pedido viene incompleto, solicitar solo lo necesario:

- Modulo destino (`administrador`, `patrimonio`, `login` u otro)
- Nombre de tabla
- Columnas (nombre, tipo y nullabilidad)
- PK esperada
- Relaciones FK
- Defaults requeridos
- Indices requeridos

## Criterios de calidad

- Script idempotente (no falla si ya existe la tabla/indice).
- Convenciones de nombres consistentes con `ADM_`, `PAT_`, `AUTH_`.
- Uso de `NVARCHAR` para texto.
- Constraints con nombre explicito (`PK_`, `FK_`, `DF_`, `IX_`/`UX_`).
- Sintaxis compatible con SQL Server.
