import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../features/users/user.store';
import { first, map } from 'rxjs';

// Este guard se encarga de proteger las rutas que solo los Admins pueden ver.

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(UserStore);
  const router = inject(Router);

  // Obtenemos el valor actual del usuario
  const user = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')!) : null;

  if (user && Number(user.cdRol) === 1) {
    return true;
  }
  console.log(user)
  console.error('Acceso denegado - Se requiere rol de Admin');
  router.navigate(['/home']);
  return false;
};
