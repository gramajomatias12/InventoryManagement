import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize, map, tap } from 'rxjs';
import { Loading } from '../../core/loading';
import { Notify } from '../../core/notify';

export interface UsuarioSesion {
  cdUsuario?: number;
  cdRol?: number;
  dsNombre?: string;
  dsLogin?: string;
  dsRol?: string;
}

@Injectable({ providedIn: 'root' })
export class LoginStore {
  private readonly _currentUser = new BehaviorSubject<UsuarioSesion | null>(this.getStoredUser());
  public readonly currentUser$ = this._currentUser.asObservable();

  public readonly isAdmin$ = this.currentUser$.pipe(
    map((user) => Number(user?.cdRol) === 1)
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

        if (res?.usuario) {
          localStorage.setItem('user_data', JSON.stringify(res.usuario));
          this._currentUser.next(res.usuario);
        }
      }),
      finalize(() => this.loading.hide())
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
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
  }
}
