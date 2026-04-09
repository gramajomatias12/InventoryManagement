import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Loading } from './loading';

// Este interceptor se encarga de mostrar una barra de carga global 
// cada vez que hay una petición HTTP en curso

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(Loading);
  
  // 1. Encendemos el motor de carga
  loadingService.show();

  return next(req).pipe(
    // 2. Pase lo que pase (éxito o error), al terminar apagamos el motor
    finalize(() => loadingService.hide())
  );
};