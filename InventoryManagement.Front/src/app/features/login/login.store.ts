import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize, map, tap, catchError, of } from 'rxjs';
import { Loading } from '../../core/loading';
import { Notify } from '../../core/notify';

export interface UsuarioSesion {
  cdUsuario?: number;
  dsNombre?: string;
  dsApellido?: string;
  dsLogin?: string;
  dsPerfil?: string;
  isAdmin?: boolean;
  cdSistema?: number;
  dsSistema?: string;
  dsPrefijo?: string;
  sesion?: string;
  // legacy - mantenidos por compatibilidad con guards existentes
  cdRol?: number;
  dsRol?: string;
}

@Injectable({ providedIn: 'root' })
export class LoginStore {
  private readonly _currentUser = new BehaviorSubject<UsuarioSesion | null>(this.getStoredUser());
  public readonly currentUser$ = this._currentUser.asObservable();

  public readonly isAdmin$ = this.currentUser$.pipe(
    map((user) => {
      const esAdminPorRolNumerico = Number(user?.cdRol) === 1;
      const dsRol = String(user?.dsRol || '').toUpperCase();
      const esAdminPorTexto = dsRol.includes('ADMIN');
      const esAdminPorFlag = (user as any)?.isAdmin === true;
      return esAdminPorRolNumerico || esAdminPorTexto || esAdminPorFlag;
    })
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private loading: Loading,
    private notify: Notify,
  ) {}

  private getStoredUser(): UsuarioSesion | null {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(credenciales: any, sistemaPrefijo?: string) {
    const authUrl = 'http://localhost:5035/api/Auth/login';
    const headers = sistemaPrefijo ? { Sistema: sistemaPrefijo } : undefined;

    this.loading.show();

    return this.http.post<{ token: string; usuario: UsuarioSesion }>(authUrl, credenciales, { headers }).pipe(
      tap((res) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }

        const uiSesion = (res as any)?.uiSesion || (res as any)?.ui_sesion || res?.usuario?.sesion || '';
        if (uiSesion) {
          localStorage.setItem('ui_sesion', String(uiSesion));
        }

        if (res?.usuario) {
          console.log('[LOGIN] payload usuario:', res.usuario);
          console.log('[LOGIN] payload completo:', res);
          localStorage.setItem('user_data', JSON.stringify(res.usuario));
          this._currentUser.next(res.usuario);
        }
      }),
      finalize(() => this.loading.hide())
    );
  }

  logout() {
    const user = this._currentUser.getValue();
    const sesionGuid = user?.sesion;

    const clearLocal = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('ui_sesion');
      localStorage.removeItem('sistema_prefijo');
      localStorage.removeItem('sistema_cd');
      localStorage.removeItem('sistema_descripcion');
      this._currentUser.next(null);
      this.loading.hide();
      this.router.navigate(['/login']).then((navigated) => {
        if (navigated) {
          this.notify.success('Sesion cerrada correctamente.');
        }
      });
    };

    if (sesionGuid) {
      this.http.post('http://localhost:5035/api/Auth/logout', { sesion: sesionGuid }).pipe(
        catchError(() => of(null))
      ).subscribe(() => clearLocal());
    } else {
      clearLocal();
    }
  }
}
