# InventoryManagement

Aplicación web modular para gestión de inventario y administración de sistemas. El proyecto está dividido en un frontend en Angular y un backend en .NET, con una estructura pensada para trabajar con distintos módulos según el sistema seleccionado al iniciar sesión.

## Estructura general

### Frontend
La carpeta InventoryManagement.Front contiene la interfaz de usuario. Actualmente el frontend está organizado por módulos funcionales, como Administrador y Patrimonio.

### Backend
La carpeta InventoryManagement.Back contiene la API y la lógica de acceso a datos.

## Organización del frontend

### Core
La carpeta core contiene servicios transversales que usa toda la aplicación:

- auth.interceptor: agrega el token y el encabezado del sistema en cada petición HTTP.
- error.interceptor: captura errores globales y muestra mensajes al usuario.
- loading.interceptor: activa y desactiva el indicador de carga durante las peticiones.
- loading: mantiene el estado global de carga para mostrar un spinner o barra de progreso.
- data: centraliza las llamadas HTTP genéricas al backend.
- auth.guard: protege rutas que requieren sesión o permisos de administrador.

### Features
La carpeta features contiene los módulos funcionales del sistema. Hoy el proyecto incluye:

- login: autenticación y selección de sistema.
- administrador: pantallas de administración general.
- patrimonio: pantallas del módulo de patrimonio.

Cada sistema puede tener su propia pantalla de inicio, su menú lateral y sus ABM o vistas específicas.

Además, dentro de cada sistema o módulo puede existir una carpeta llamada scripts, donde se guardan los stored procedures necesarios para el ABM o para la lógica asociada a esa funcionalidad.

### Shared
La carpeta shared contiene componentes reutilizables, por ejemplo diálogos de confirmación u otros elementos comunes.

## Flujo actual del frontend

1. El usuario inicia sesión desde la pantalla de login.
2. Selecciona el sistema con el que quiere trabajar.
3. La aplicación guarda el token, el prefijo del sistema y otros datos de sesión.
4. Según el prefijo elegido, el usuario es redirigido al módulo correspondiente.
5. El shell principal detecta automáticamente si la ruta actual pertenece a un sistema protegido y, si la ruta declara un menú, lo renderiza de forma dinámica.
6. El login también resuelve el destino a partir de la metadata de rutas, sin hardcodear prefijos en el componente.
7. Los interceptores de core se encargan automáticamente de autenticación, loading y manejo de errores.

## Cómo agregar un nuevo sistema al frontend

Paso a paso breve:

1. Crear una nueva carpeta dentro de features con el nombre del sistema.
2. Crear el componente principal del módulo y sus rutas hijas.
3. Agregar, como mínimo, una vista de inicio y, si hace falta, un menú propio.
4. Registrar la nueva ruta principal en app.routes.ts.
5. En esa misma ruta, definir el prefijo en data.prefijo y, si corresponde, el menú lateral en data.menuComponent.
6. Si el módulo necesita consumir datos, crear su store y reutilizar los servicios de core, especialmente data y loading.

## Convención sugerida para nuevos sistemas

Para mantener el proyecto ordenado, conviene seguir esta idea:

- nombre de carpeta del módulo según el sistema
- componente principal del sistema
- componente de inicio
- componente de menú
- componentes ABM según la necesidad del módulo

## Nota importante

Por ahora, este paso a paso cubre solamente la parte frontend. Más adelante habrá que completar el alta del sistema en backend, base de datos y lógica de autenticación para que quede totalmente operativo.

