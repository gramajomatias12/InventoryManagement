import { HttpInterceptorFn } from '@angular/common/http';

// Este interceptor se encarga de agregar el token JWT 
// a las peticiones HTTP salientes, si es que existe un token guardado en el localStorage.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Si tenemos token, clonamos la petición y le ponemos el header Bearer
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};