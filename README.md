# InventoryManagement

#frontend 
#core
En esa carpeta hay un servicio de datos y varias piezas transversales para seguridad y experiencia de usuario:

auth.interceptor.ts: agrega automáticamente el token de autenticación y el encabezado del sistema a cada petición HTTP.

error.interceptor.ts: centraliza el manejo de errores del backend, muestra mensajes al usuario y, si la sesión expira, limpia los datos y redirige al login.

loading.interceptor.ts: enciende y apaga el indicador global de carga mientras una petición está en proceso.

loading.ts: mantiene el estado de carga de la aplicación para que otros componentes puedan mostrar u ocultar un spinner.

data.ts: es el servicio genérico que se comunica con el backend para consultar y enviar datos de distintas entidades.

auth.guard.ts: protege rutas y permite el acceso solo a usuarios con rol de administrador.

#features

