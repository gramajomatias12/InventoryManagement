import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';
import { Login } from './features/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: 'patrimonio',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/patrimonio/patrimonio').then((m) => m.PATRIMONIO_ROUTES),
  },
  {
    path: 'administrador',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/administrador/administrador').then((m) => m.ADMINISTRADOR_ROUTES),
  },
 
  // Si no pone nada en la URL, lo mandamos al Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Si pone cualquier cosa que no existe, al Login o Home
  { path: '**', redirectTo: 'login' }
];