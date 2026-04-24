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
  private readonly SISTEMA = 'ADM';
  private readonly SISTEMA_ADM = 'ADM';

  private readonly _sistemas = new BehaviorSubject<SistemaItem[]>([]);
  public readonly sistemas$ = this._sistemas.asObservable();

  private readonly _usuarios = new BehaviorSubject<any[]>([]);
  public readonly usuarios$ = this._usuarios.asObservable();

  private readonly _roles = new BehaviorSubject<any[]>([]);
  public readonly roles$ = this._roles.asObservable();

  private readonly _rolesAdm = new BehaviorSubject<any[]>([]);
  public readonly rolesAdm$ = this._rolesAdm.asObservable();

  constructor(
    private data: Data,
    private loading: Loading,
  ) {}

  private readonly _perfiles = new BehaviorSubject<any[]>([]);
  public readonly perfiles$ = this._perfiles.asObservable();

  private readonly _usuariosPerfiles = new BehaviorSubject<any[]>([]);
  public readonly usuariosPerfiles$ = this._usuariosPerfiles.asObservable();

  private readonly _perfilesRoles = new BehaviorSubject<any[]>([]);
  public readonly perfilesRoles$ = this._perfilesRoles.asObservable();

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

  loadPerfiles(cdSistema?: number) {
    this.loading.show();
    this.data.getEntidad('Perfiles', this.SISTEMA_ADM)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          const perfiles = Array.isArray(list) ? list : [];
          const filtrados = cdSistema
            ? perfiles.filter((p: any) => Number(p?.cdSistema) === Number(cdSistema))
            : perfiles;
          this._perfiles.next(filtrados);
        },
        error: (err) => console.error('Error cargando perfiles:', err)
      });
  }

  loadRolesAdm(cdSistema?: number) {
    this.loading.show();
    this.data.getEntidad('Roles', this.SISTEMA_ADM)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          const roles = Array.isArray(list) ? list : [];
          const filtrados = cdSistema
            ? roles.filter((r: any) => Number(r?.cdSistema) === Number(cdSistema))
            : roles;
          this._rolesAdm.next(filtrados);
        },
        error: (err) => console.error('Error cargando roles ADM:', err)
      });
  }

  loadPerfilesRoles(cdSistema?: number) {
    this.loading.show();
    this.data.getEntidad('PerfilesRoles', this.SISTEMA_ADM)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          const relaciones = Array.isArray(list) ? list : [];
          const filtradas = cdSistema
            ? relaciones.filter((pr: any) => Number(pr?.cdSistema) === Number(cdSistema))
            : relaciones;
          this._perfilesRoles.next(filtradas);
        },
        error: (err) => console.error('Error cargando perfiles-roles:', err)
      });
  }

  loadUsuariosPerfiles(cdUsuario: number) {
    this.loading.show();
    this.data.getEntidad(`UsuariosPerfiles/${cdUsuario}`, this.SISTEMA_ADM)
      .pipe(finalize(() => this.loading.hide()))
      .subscribe({
        next: (res) => {
          const list = typeof res === 'string' ? JSON.parse(res) : res;
          this._usuariosPerfiles.next(Array.isArray(list) ? list : []);
        },
        error: (err) => console.error('Error cargando usuarios-perfiles:', err)
      });
  }

  saveUsuarioPerfil(cdUsuario: number, cdPerfil: number, dsDatos?: string) {
    return this.data.postEntidad('UsuariosPerfiles', { cdUsuario, cdPerfil, dsDatos }, this.SISTEMA_ADM);
  }

  deleteUsuarioPerfil(cdUsuario: number, cdPerfil: number) {
    return this.data.postEntidad('UsuariosPerfiles_D', { cdUsuario, cdPerfil }, this.SISTEMA_ADM);
  }

  savePerfil(payload: { cdPerfil?: number; dsPerfil: string; cdSistema: number; dsDescripcion?: string; icBorrado?: boolean }) {
    this.loading.show();
    return this.data.postEntidad('Perfiles', payload, this.SISTEMA_ADM).pipe(
      finalize(() => this.loading.hide())
    );
  }

  saveRol(payload: { cdRol?: number; dsRol: string; cdSistema: number; dsNombre: string; dsDescripcion?: string; icBorrado?: boolean }) {
    this.loading.show();
    return this.data.postEntidad('Roles', payload, this.SISTEMA_ADM).pipe(
      finalize(() => this.loading.hide())
    );
  }

  savePerfilRol(cdPerfil: number, cdRol: number) {
    this.loading.show();
    return this.data.postEntidad('PerfilesRoles', { cdPerfil, cdRol }, this.SISTEMA_ADM).pipe(
      finalize(() => this.loading.hide())
    );
  }
}
