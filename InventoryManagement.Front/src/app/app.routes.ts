import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { PatMenu } from './features/patrimonio/pat-menu/pat-menu';
import { AdmMenu } from './features/administrador/adm-menu/adm-menu';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: 'patrimonio',
    canActivate: [authGuard],
    data: { prefijo: 'PAT', menuComponent: PatMenu },
    loadChildren: () =>
      import('./features/patrimonio/patrimonio').then((m) => m.PATRIMONIO_ROUTES),
  },
  {
    path: 'administrador',
    canActivate: [authGuard],
    data: { prefijo: 'ADM', menuComponent: AdmMenu },
    loadChildren: () =>
      import('./features/administrador/administrador').then((m) => m.ADMINISTRADOR_ROUTES),
  },
 
  // Si no pone nada en la URL, lo mandamos al Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Si pone cualquier cosa que no existe, al Login o Home
  { path: '**', redirectTo: 'login' }
];