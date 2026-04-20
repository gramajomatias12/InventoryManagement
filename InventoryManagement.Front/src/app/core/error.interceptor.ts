import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Notify } from './notify';

// Este interceptor se encarga de manejar los errores HTTP globalmente, 
// mostrando un mensaje adecuado según el código de error.

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notify = inject(Notify);

    return next(req).pipe(
        catchError((error) => {
            let mensaje = 'Ocurrió un error inesperado';

            if (error.status === 400) {
                mensaje = 'Solicitud incorrecta';
            }
            else if (error.status === 401) {
                mensaje = 'Sesión expirada o no autorizada';
                localStorage.clear(); // Limpiamos todo
                window.location.href = '/login'; // O usá el router.navigate si inyectás Router
            }
            else if (error.status === 404) {
                mensaje = 'No se encontró el recurso solicitado';
            } else if (error.status === 0) {
                mensaje = 'El servidor está apagado o no hay internet';
            } else if (error.error && typeof error.error === 'string') {
                mensaje = error.error; // Mensaje directo de SQL/.NET
            }

            notify.error(mensaje);

            return throwError(() => error);
        })
    );
};