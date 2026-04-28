import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function getStoredUser() {
  const rawUser = localStorage.getItem('user_data');
  return rawUser ? JSON.parse(rawUser) : null;
}

// este guard se encarga de proteger las rutas que requieren autenticación, 
// sin importar el rol del usuario.
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

  const esAdminPorRolNumerico = Number(user?.cdRol) === 1;
  const dsRol = String(user?.dsRol || '').toUpperCase();
  const esAdminPorTexto = dsRol.includes('ADMIN');
  const esAdminPorFlag = user?.isAdmin === true;

  if (user && (esAdminPorRolNumerico || esAdminPorTexto || esAdminPorFlag)) {
    return true;
  }

  console.error('Acceso denegado - Se requiere rol de Admin');
  router.navigate(['/login']);
  return false;
};
