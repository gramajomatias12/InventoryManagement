import { Injectable } from '@angular/core';

export interface PermissionMenuItem {
  label: string;
  route: string;
  icon?: string;
  description?: string;
  requiredRole?: string;
  requiredRoles?: string[];
  public?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  getUserRoles(user?: any): string[] {
    const sourceUser = user ?? this.getStoredUser();
    if (!sourceUser) {
      return [];
    }

    const roles = new Set<string>();

    this.collectRolesFromArray(sourceUser.roles, roles);
    this.collectRolesFromArray(sourceUser.perfilesRoles, roles);

    if (Array.isArray(sourceUser.usuariosPerfiles)) {
      for (const up of sourceUser.usuariosPerfiles) {
        this.collectRolesFromArray(up?.roles, roles);
        this.collectRolesFromArray(up?.perfilesRoles, roles);
      }
    }

    const dsRol = this.normalizeRole(sourceUser.dsRol);
    if (dsRol) {
      roles.add(dsRol);
    }

    if (sourceUser.isAdmin === true) {
      roles.add('ADMIN');
      roles.add('ADM_ADM');
    }

    return Array.from(roles);
  }

  hasRole(role: string, user?: any): boolean {
    const roleNormalized = this.normalizeRole(role);
    if (!roleNormalized) {
      return false;
    }

    const userRoles = this.getUserRoles(user);
    return userRoles.includes(roleNormalized);
  }

  hasAnyRole(roles: string[] = [], user?: any): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    const userRoles = this.getUserRoles(user);
    const requestedRoles = roles
      .map((role) => this.normalizeRole(role))
      .filter((role) => !!role);

    return requestedRoles.some((role) => userRoles.includes(role));
  }

  canAccessMenuItem(item: PermissionMenuItem, user?: any): boolean {
    if (item.public) {
      return true;
    }

    if (item.requiredRole) {
      return this.hasRole(item.requiredRole, user);
    }

    if (item.requiredRoles && item.requiredRoles.length > 0) {
      return this.hasAnyRole(item.requiredRoles, user);
    }

    return true;
  }

  private collectRolesFromArray(values: any, roles: Set<string>): void {
    if (!Array.isArray(values)) {
      return;
    }

    for (const item of values) {
      const direct = this.normalizeRole(item);
      if (direct) {
        roles.add(direct);
        continue;
      }

      const objectRole = this.normalizeRole(
        item?.rol ?? item?.dsRol ?? item?.nombre ?? item?.dsNombre ?? item?.codigo ?? item?.code
      );

      if (objectRole) {
        roles.add(objectRole);
      }
    }
  }

  private normalizeRole(value: any): string {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim().toUpperCase();
  }

  private getStoredUser(): any | null {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  }
}
