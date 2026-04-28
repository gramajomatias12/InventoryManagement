import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PermissionMenuItem, PermissionService } from '../../../core/permission.service';

@Component({
  selector: 'app-pat-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './pat-menu.html',
  styleUrl: './pat-menu.scss',
})
export class PatMenu {
  constructor(private permissionService: PermissionService) {}

  menuItems: PermissionMenuItem[] = [
    {
      label: 'Panel',
      route: '/patrimonio/inicio',
      icon: 'space_dashboard',
      description: 'Resumen del modulo y accesos rapidos.',
      public: true,
    },
    {
      label: 'Categorias',
      route: '/patrimonio/categorias',
      icon: 'category',
      description: 'Organiza las familias y clasificaciones del inventario.',
      requiredRoles: ['PAT_ADM', 'PAT_USU'],
    },
  ];

  get visibleItems(): PermissionMenuItem[] {
    return this.menuItems.filter((item) => this.permissionService.canAccessMenuItem(item));
  }

}
