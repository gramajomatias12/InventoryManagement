import { Component } from '@angular/core';
import { Route, RouterOutlet } from '@angular/router';
import { PatCategorias } from './pat-categorias/pat-categorias';
import { PatCategoriasEditar } from './pat-categorias/pat-categorias-editar/pat-categorias-editar';
import { PatProveedores } from './pat-proveedores/pat-proveedores';
import { PatProveedoresEditar } from './pat-proveedores/pat-proveedores-editar/pat-proveedores-editar';
import { PatInicio } from './pat-inicio/pat-inicio';
import { permissionGuard } from '../../core/auth.guard';

@Component({
  selector: 'app-patrimonio',
  imports: [RouterOutlet],
  templateUrl: './patrimonio.html',
  styleUrls: ['./patrimonio.scss'],
})


export class Patrimonio {

}

export const PATRIMONIO_ROUTES: Route[] = [
  {
    path: '',
    component: Patrimonio, // El padre
    children: [
      { path: 'inicio', component: PatInicio },
      {
        path: 'categorias',
        component: PatCategorias,
        canActivate: [permissionGuard],
        data: { requiredRoles: ['PAT_ADM', 'PAT_USU'] }
      },
      {
        path: 'categorias/:id',
        component: PatCategoriasEditar,
        canActivate: [permissionGuard],
        data: { requiredRoles: ['PAT_ADM', 'PAT_USU'] }
      },
      {
        path: 'proveedores',
        component: PatProveedores,
        canActivate: [permissionGuard],
        data: { requiredRoles: ['PAT_ADM', 'PAT_USU'] }
      },
      {
        path: 'proveedores/:id',
        component: PatProveedoresEditar,
        canActivate: [permissionGuard],
        data: { requiredRoles: ['PAT_ADM', 'PAT_USU'] }
      },

    
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: '**', component: PatInicio }
    ]
  }
];