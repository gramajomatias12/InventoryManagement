import { Type } from '@angular/core';
import { Route } from '@angular/router';

function getBasePathByRoute(route: Route | undefined): string | null {
  return route?.path ? `/${route.path}` : null;
}

export function getSystemRoutes(routes: Route[]): Route[] {
  return routes.filter(route =>
    !!route.path &&
    route.path !== 'login' &&
    route.path !== '**' &&
    route.path !== '' &&
    !!route.canActivate?.length
  );
}

export function getRouteByPrefijo(routes: Route[], prefijo: string): Route | undefined {
  return getSystemRoutes(routes).find(route =>
    route.data?.['prefijo']?.toUpperCase() === (prefijo || '').toUpperCase()
  );
}

export function getRutaSistema(routes: Route[], prefijo: string): string | null {
  return getBasePathByRoute(getRouteByPrefijo(routes, prefijo));
}

export function getRutaActual(routes: Route[], url: string): Route | undefined {
  const currentPath = url.split('?')[0].split('#')[0];

  return getSystemRoutes(routes).find(route => {
    const basePath = getBasePathByRoute(route);
    return !!basePath && (currentPath === basePath || currentPath.startsWith(`${basePath}/`));
  });
}

export function getMenuComponent(route: Route | undefined): Type<unknown> | null {
  return (route?.data?.['menuComponent'] as Type<unknown>) ?? null;
}
