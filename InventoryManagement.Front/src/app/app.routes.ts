import { Routes } from '@angular/router';
import { adminGuard } from './core/auth.guard';
import { UserList } from './features/users/user-list/user-list';
import { Inicio } from './features/inicio/inicio';
import { Login } from './features/auth/login/login';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'home', component: Inicio },
  { 
    path: 'usuarios', 
    component: UserList,
    canActivate: [adminGuard] 
  },
  // Si no pone nada en la URL, lo mandamos al Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Si pone cualquier cosa que no existe, al Login o Home
  { path: '**', redirectTo: 'login' } 
];