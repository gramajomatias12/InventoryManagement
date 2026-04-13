import { HttpInterceptorFn } from '@angular/common/http';

// Este interceptor se encarga de agregar el token JWT 
// a las peticiones HTTP salientes, si es que existe un token guardado en el localStorage.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const sistema = localStorage.getItem('sistema_prefijo') || 'SIS';
  const headers: Record<string, string> = {};

  // Si tenemos token, agregamos header Bearer
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si la request no trae sistema, usamos el sistema actual guardado
  if (!req.headers.has('Sistema')) {
    headers['Sistema'] = sistema;
  }

  if (Object.keys(headers).length === 0) {
    return next(req);
  }

  return next(req.clone({ setHeaders: headers }));
};