import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-adm-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './adm-inicio.html',
  styleUrl: './adm-inicio.scss',
})
export class AdmInicio {
  protected readonly metricas = [
    { valor: '2', etiqueta: 'Areas clave', detalle: 'Usuarios y sistemas bajo control' },
    { valor: '1', etiqueta: 'Perfil sensible', detalle: 'Administracion con permisos elevados' },
    { valor: '100%', etiqueta: 'Vista centralizada', detalle: 'Accesos principales desde un solo panel' },
  ];

  protected readonly accesos = [
    {
      titulo: 'Gestionar usuarios',
      descripcion: 'Controla altas, bajas, roles y la disponibilidad de acceso por persona.',
      icono: 'group',
      ruta: '/administrador/usuarios',
      accion: 'Ir a usuarios'
    },
    {
      titulo: 'Configurar sistemas',
      descripcion: 'Administra prefijos, sistemas disponibles y su comportamiento operativo.',
      icono: 'apps',
      ruta: '/administrador/sistemas',
      accion: 'Ir a sistemas'
    }
  ];
}
