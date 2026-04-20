import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pat-inicio',
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './pat-inicio.html',
  styleUrl: './pat-inicio.scss',
})
export class PatInicio {
  protected readonly metricas = [
    { valor: '12', etiqueta: 'Categorias activas', detalle: 'Base inicial del modulo' },
    { valor: '3', etiqueta: 'Flujos listos', detalle: 'Carga, clasificacion y consulta' },
    { valor: '24h', etiqueta: 'Ultima revision', detalle: 'Control operativo reciente' },
  ];

  protected readonly accesos = [
    {
      titulo: 'Gestionar categorias',
      descripcion: 'Edita la estructura principal para ordenar el inventario patrimonial.',
      icono: 'category',
      ruta: '/patrimonio/categorias',
      accion: 'Abrir categorias'
    },
    {
      titulo: 'Preparar altas',
      descripcion: 'Usa una base consistente antes de comenzar con la carga de bienes.',
      icono: 'inventory_2',
      ruta: '/patrimonio/categorias',
      accion: 'Revisar base'
    }
  ];

}
