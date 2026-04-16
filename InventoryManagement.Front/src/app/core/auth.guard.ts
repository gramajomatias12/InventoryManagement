import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function getStoredUser() {
  const rawUser = localStorage.getItem('user_data');
  return rawUser ? JSON.parse(rawUser) : null;
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (token && user) {
    return true;
  }

  console.error('Acceso denegado - Se requiere iniciar sesión');
  router.navigate(['/login']);
  return false;
};

// Este guard se encarga de proteger las rutas que solo los Admins pueden ver.
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = getStoredUser();

  if (user && Number(user.cdRol) === 1) {
    return true;
  }

  console.error('Acceso denegado - Se requiere rol de Admin');
  router.navigate(['/login']);
  return false;
};
