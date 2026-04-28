import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PermissionMenuItem, PermissionService } from '../../../core/permission.service';

@Component({
  selector: 'app-adm-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './adm-menu.html',
  styleUrl: './adm-menu.scss',
})
export class AdmMenu {
  constructor(private permissionService: PermissionService) {}

  menuItems: PermissionMenuItem[] = [
    {
      label: 'Panel',
      route: '/administrador/inicio',
      icon: 'space_dashboard',
      description: 'Vista general del modulo y accesos directos.',
      public: true,
    },
    {
      label: 'Usuarios',
      route: '/administrador/usuarios',
      icon: 'group',
      description: 'Altas, permisos y mantenimiento de cuentas.',
      requiredRoles: ['ADM_ADM'],
    },
    {
      label: 'Sistemas',
      route: '/administrador/sistemas',
      icon: 'apps',
      description: 'Administracion de modulos, prefijos y disponibilidad.',
      requiredRoles: ['ADM_ADM'],
    },
  ];

  get visibleItems(): PermissionMenuItem[] {
    return this.menuItems.filter((item) => this.permissionService.canAccessMenuItem(item));
  }
}
