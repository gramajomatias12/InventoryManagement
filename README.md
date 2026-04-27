# InventoryManagement

Aplicación web modular para administración de sistemas e inventario. El proyecto está dividido en un frontend Angular y un backend ASP.NET Core, con autenticación por sistema y auditoría de sesiones en base de datos.

## Stack actual

- Frontend: Angular 20
- Backend: ASP.NET Core 8
- Base de datos: SQL Server
- Autenticación: JWT + stored procedures por sistema

## Estructura del repositorio

### InventoryManagement.Front
Contiene la aplicación Angular.

- `src/app/core`: interceptores, guards, servicios base y estado global
- `src/app/features/login`: login, selección de sistema y scripts SQL de autenticación
- `src/app/features/administrador`: ABM y administración general
- `src/app/features/patrimonio`: módulo funcional de patrimonio
- `src/app/shared`: componentes reutilizables

### InventoryManagement.Back
Contiene la API .NET.

- `InventoryManagement.API/Controllers`: endpoints HTTP
- `InventoryManagement.API/Classes`: acceso a datos y servicios auxiliares
- `InventoryManagement.API/Models`: modelos de request/response

## Configuración actual

### Backend

- Framework: `net8.0`
- URL local principal: `http://localhost:5035`
- Swagger: `http://localhost:5035/swagger`
- Connection string por defecto: `Server=Tecnologias-05;Database=DBPrueba;Trusted_Connection=True;TrustServerCertificate=True;`

Si el servidor SQL o la base cambian, actualizar `InventoryManagement.Back/InventoryManagement.API/appsettings.json`.

### Frontend

Scripts principales:

- `npm start`: levanta Angular en desarrollo
- `npm run build`: compila la aplicación
- `npm test`: ejecuta tests

## Cómo levantar el proyecto

### 1. Backend

Desde `InventoryManagement.Back/InventoryManagement.API`:

```powershell
dotnet restore
dotnet run
```

### 2. Frontend

Desde `InventoryManagement.Front`:

```powershell
npm install
npm start
```

## Flujo de autenticación actual

1. El frontend envía credenciales a `POST /api/Auth/login`.
2. El backend toma el encabezado `Sistema` y ejecuta el procedimiento `{PREFIJO}_Login`.
3. Si el login es correcto, el backend genera JWT y registra la sesión en tablas AUTH.
4. El frontend guarda token, datos del usuario, sistema actual y el identificador de sesión.
5. Al hacer logout, el frontend llama `POST /api/Auth/logout`.
6. El backend actualiza la sesión activa en `AUTH_Sesiones` y deja trazabilidad en `AUTH_LogAcceso`.

## Auditoría de sesiones

La autenticación actual usa estas tablas/procedimientos:

- `AUTH_UserAgent`
- `AUTH_Sesiones`
- `AUTH_LogAcceso`
- `AUTH_RegistrarSesion_IU`
- `AUTH_CerrarSesion_IU`

Comportamiento actual:

- Login: inserta una nueva fila en `AUTH_Sesiones` con `icActiva = 1`
- Logout: actualiza esa fila con `icActiva = 0`, `dtCierre` y `dsMotivoCierre = 'logout'`

Validación de sesión en operaciones de entidad:

- El frontend propaga `X-Session-Id` en las llamadas de datos.
- El backend captura `X-Session-Id`, IP (`X-Forwarded-For` o IP remota) y `User-Agent` en `EntidadController`.
- `AccesoDatos` detecta en tiempo de ejecución si el SP soporta `@uiSesion`, `@ip` y `@userAgent`, y los envía solo cuando existen.
- Los SPs administrativos actuales validan sesión y permisos mediante `AUTH_Sesiones_S`.

## Convenciones del backend

El backend trabaja con procedimientos almacenados y convención por prefijo:

- Login por sistema: `{PREFIJO}_Login`
- Consultas genéricas: `{PREFIJO}_{Entidad}_S`
- Altas/modificaciones: `{PREFIJO}_{Entidad}_IU`
- Parámetros opcionales de seguridad por SP: `@uiSesion`, `@ip`, `@userAgent`

Prefijo por defecto actual: `ADM`

## Módulos actuales

### Login

- Selección de sistema
- Generación y persistencia de token
- Persistencia de sesión autenticada
- Logout con cierre de sesión en base

### Administrador

- Gestión de sistemas
- Gestión de usuarios
- Gestión de perfiles y roles
- Asignación de perfiles por sistema a usuarios

### Patrimonio

- Base del módulo funcional con sus propios stored procedures por prefijo `PAT`

## Scripts SQL

Los scripts SQL están versionados dentro del frontend, cerca de cada funcionalidad:

- `InventoryManagement.Front/src/app/features/login/scripts`
- `InventoryManagement.Front/src/app/features/administrador/scripts`
- `InventoryManagement.Front/src/app/features/patrimonio/scripts`

Scripts relevantes de autenticación:

- `ADM_Login.sql`
- `PAT_Login.sql`
- `AUTH_UserAgent.sql`
- `AUTH_Sesiones.sql`
- `AUTH_Sesiones_S.sql`
- `AUTH_LogAcceso.sql`
- `AUTH_LogAcceso_IU.sql`
- `AUTH_RegistrarSesion_IU.sql`
- `AUTH_CerrarSesion_IU.sql`

Cambios recientes en scripts de administrador:

- Se agregó validación de sesión/rol en SPs `ADM_*` de sistemas, usuarios, perfiles, roles y asignaciones.
- Se eliminó la columna `dsRoles` de `ADM_Perfiles`; la relación perfil-rol queda normalizada en `ADM_PerfilesRoles`.
- Se retiraron scripts legacy `SIS_*` de administrador para unificar convención en `ADM_*`.

## Cómo agregar un nuevo sistema

1. Crear el módulo en `src/app/features/<sistema>`.
2. Registrar su ruta en el router del frontend.
3. Definir el prefijo del sistema en metadata de ruta.
4. Crear el procedimiento `{PREFIJO}_Login`.
5. Crear los procedimientos `{PREFIJO}_{Entidad}_S` y `{PREFIJO}_{Entidad}_IU` necesarios.
6. Dar de alta el sistema, perfiles y roles en base de datos.

## Estado funcional actual

- Login por sistema funcionando con prefijos `ADM` y `PAT`
- Registro de sesiones AUTH funcionando
- Logout con cierre de sesión AUTH implementado
- Propagación de `ui_sesion` (`X-Session-Id`) desde frontend a backend activa
- Validación de sesión/IP/User-Agent y control de rol en SPs administrativos activa
- Administración multi-sistema de perfiles y roles en progreso funcional


