import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { Data } from '../../core/data';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Este servicio es el "store" de usuarios. Maneja el estado relacionado con la autenticación,
// la lista de usuarios y roles, y proporciona métodos para interactuar con el backend.

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  // 1. PRIMERO declaramos las variables de estado
// Guarda el usuario logueado.
// Empieza en null si no hay sesión.
// currentUser$ permite que otros componentes escuchen cambios.

  private readonly _currentUser = new BehaviorSubject<any>(null);
  public readonly currentUser$ = this._currentUser.asObservable();

  private http = inject(HttpClient);

  // Saber si el usuario es admin
  public readonly isAdmin$ = this.currentUser$.pipe(
    map(user => {
      if (!user) return false;
      return Number(user.cdRol) === 1;
    })
  );

  //Lista de usuarios y roles
  private readonly _users = new BehaviorSubject<any[]>([]);
  public readonly users$ = this._users.asObservable();

  private readonly _roles = new BehaviorSubject<any[]>([]);
  public readonly roles$ = this._roles.asObservable();

  // 2. SEGUNDO el constructor
  constructor(private data: Data, private router: Router) {
    this.autoLogin();
  }

  get usersValue() { return this._users.getValue(); }

  // 3. TERCERO los métodos

// Busca en localStorage si ya había una sesión guardada.
// Si encuentra token y datos del usuario, restaura la sesión.
  private autoLogin() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user_data');

    if (token && savedUser) {
      this._currentUser.next(JSON.parse(savedUser));
    }
  }

  // Inicia sesión y deja todo listo en memoria y localStorage.
  login(credenciales: any) {
    const authUrl = 'http://localhost:5035/api/Auth/login';

    return this.http.post(authUrl, credenciales).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          // res.usuario ahora debería ser el objeto que viste en SQL
          localStorage.setItem('user_data', JSON.stringify(res.usuario));
          this._currentUser.next(res.usuario);
        }
      })
    );
  }

  // Cierra sesión: limpia todo y redirige a login.
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data'); // <-- Limpiamos todo
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  //Pide al backend la lista de usuarios.Si viene como texto JSON, la convierte.
  //Guarda la lista en _users.
  loadUsers() {
    this.data.getEntidad('Usuarios').subscribe(data => {
      const list = typeof data === 'string' ? JSON.parse(data) : data;
      this._users.next(list);
    });
  }

  //mostrar solo usuarios activos.
  readonly activeUsers$ = this.users$.pipe(
    map(users => users.filter(u => u.icActivo))
  );

  // Guarda un nuevo usuario o actualiza uno existente.
  saveUser(userData: any) {

    this.data.postEntidad('Usuarios', userData).subscribe({
      next: () => {
        this.loadUsers();
        console.log('Usuario guardado con éxito');
      },
      error: (err) => console.error('Error al guardar:', err)
    });
    // Por ahora, devolvemos un Observable vacío para que el subscribe en el componente no falle
    return this.data.postEntidad('Usuarios', userData);

  }

  // Elimina un usuario por su ID.
  deleteUser(cdUsuario: number) {
    const dataABorrar = { cdUsuario: cdUsuario };
    return this.data.postEntidad('Usuarios_D', dataABorrar);
  }

  //Pide al backend la lista de roles.Si viene como texto JSON, la convierte.
  //Guarda la lista en _roles.
  loadRoles() {
    this.data.getEntidad('Roles').subscribe(data => {
      const list = typeof data === 'string' ? JSON.parse(data) : data;
      this._roles.next(list);
    });
  }
}