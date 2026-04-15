import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { Data } from '../../core/data';
import { Loading } from '../../core/loading';

export interface SistemaItem {
  id: number;
  descripcion: string;
  prefijo: string;
  icBaja: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdministradorStore {
  private readonly SISTEMA = 'SIS';

  private readonly _sistemas = new BehaviorSubject<SistemaItem[]>([]);
  public readonly sistemas$ = this._sistemas.asObservable();

  private readonly _usuarios = new BehaviorSubject<any[]>([]);
  public readonly usuarios$ = this._usuarios.asObservable();

  private readonly _roles = new BehaviorSubject<any[]>([]);
  public readonly roles$ = this._roles.asObservable();

  constructor(private data: Data, private loading: Loading) {}

  loadSistemas() {
    this.loading.show();
    this.data.getEntidad('Sistemas', this.SISTEMA)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          this._sistemas.next(Array.isArray(list) ? list : []);
        },
        error: (err) => console.error('Error cargando sistemas:', err)
      });
  }

  saveSistema(sistema: Partial<SistemaItem>) {
    this.loading.show();
    return this.data.postEntidad('Sistemas', sistema, this.SISTEMA).pipe(
      finalize(() => {
        this.loading.hide();
        this.loadSistemas();
      })
    );
  }

  loadUsuarios() {
    this.loading.show();
    this.data.getEntidad('Usuarios', this.SISTEMA)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          this._usuarios.next(Array.isArray(list) ? list : []);
        },
        error: (err) => console.error('Error cargando usuarios:', err)
      });
  }

  saveUsuario(usuario: any) {
    this.loading.show();
    return this.data.postEntidad('Usuarios', usuario, this.SISTEMA).pipe(
      finalize(() => {
        this.loading.hide();
        this.loadUsuarios();
      })
    );
  }

  loadRoles() {
    this.loading.show();
    this.data.getEntidad('Roles', this.SISTEMA)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          this._roles.next(Array.isArray(list) ? list : []);
        },
        error: (err) => console.error('Error cargando roles:', err)
      });
  }
}
