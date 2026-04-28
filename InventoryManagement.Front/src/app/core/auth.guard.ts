import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from './permission.service';

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

// Guard por permisos especificos de ruta.
// La ruta puede definir en data.requiredRole (string) o data.requiredRoles (string[]).
export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);

  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token || !user) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['requiredRole'] as string | undefined;
  const requiredRoles = route.data?.['requiredRoles'] as string[] | undefined;
  const roles = requiredRoles && requiredRoles.length > 0
    ? requiredRoles
    : (requiredRole ? [requiredRole] : []);

  if (roles.length === 0) {
    return true;
  }

  const hasAccess = permissionService.hasAnyRole(roles, user);
  if (hasAccess) {
    return true;
  }

  console.error('Acceso denegado - Permisos insuficientes para ruta', state.url, roles);
  router.navigate(['/login']);
  return false;
};
