import { Component } from '@angular/core';
import { Route, RouterOutlet } from '@angular/router';
import { AdmInicio } from './adm-inicio/adm-inicio';
import { AdmUsuarios } from './adm-usuarios/adm-usuarios';
import { AdmUsuariosEditar } from './adm-usuarios/adm-usuarios-editar/adm-usuarios-editar';
import { AdmSistemas } from './adm-sistemas/adm-sistemas';
import { AdmSistemasEditar } from './adm-sistemas/adm-sistemas-editar/adm-sistemas-editar';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './administrador.html',
  styleUrl: './administrador.scss',
})
export class Administrador {}

export const ADMINISTRADOR_ROUTES: Route[] = [
  {
    path: '',
    component: Administrador,
    children: [
      { path: 'inicio', component: AdmInicio },
      { path: 'usuarios', component: AdmUsuarios },
      { path: 'usuarios/:id', component: AdmUsuariosEditar },
      { path: 'sistemas', component: AdmSistemas },
      { path: 'sistemas/:id', component: AdmSistemasEditar },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: '**', redirectTo: 'inicio' }
    ]
  }
];
