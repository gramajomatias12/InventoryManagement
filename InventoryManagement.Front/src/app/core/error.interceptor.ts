import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

// Este interceptor se encarga de manejar los errores HTTP globalmente, 
// mostrando un mensaje adecuado según el código de error.

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const snack = inject(MatSnackBar);

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

            snack.open(mensaje, 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar'] // Opcional: para ponerlo rojo con CSS
            });

            return throwError(() => error);
        })
    );
};