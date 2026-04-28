import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { Data } from '../../core/data';
import { getRutaSistema } from '../../core/system-routes';
import { Notify } from '../../core/notify';
//import { Loading } from '../../core/loading';
import { LoginStore } from './login.store';

interface Sistema {
  id: number;
  descripcion: string;
  prefijo: string;
  icBaja: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})


export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(LoginStore);
  private router = inject(Router);
  private notify = inject(Notify);
  // private loading = inject(Loading);
  // private document = inject(DOCUMENT);
  hide = signal(true);
  loginError = signal<string | null>(null);
  submitting = signal(false);
  public sistemas: Sistema[] = [];
  
  loginForm = this.fb.group({
    dsLogin: [null, [Validators.required]],
    dsContraseña: [null, [Validators.required, Validators.minLength(4)]],
    idSistema: [null as number | null, [Validators.required]]
  });

  constructor(private data: Data) {
    this.cargarSistemas();
   }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const prefijo = localStorage.getItem('sistema_prefijo') || 'ADM';
      const rutaDestino = this.getRutaSistema(prefijo);
      if (!rutaDestino) {
        this.store.logout();
        return;
      }

      this.router.navigate([rutaDestino]);
    }
  }

  onSubmit() {
    this.loginError.set(null);

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.loginError.set('Revisa usuario, contraseña y sistema antes de ingresar.');
      return;
    }

    const sistemaSeleccionado = this.getSistemaSeleccionado();

    if (!sistemaSeleccionado) {
      this.loginError.set('Selecciona un sistema valido para continuar.');
      return;
    }

    const rutaDestino = this.getRutaSistema(sistemaSeleccionado.prefijo);
    if (!rutaDestino) {
      this.loginError.set('El sistema seleccionado no tiene un modulo disponible.');
      console.error('Sistema sin módulo frontend disponible:', sistemaSeleccionado.prefijo);
      return;
    }

    this.submitting.set(true);

    this.store.login(this.loginForm.value, sistemaSeleccionado.prefijo).subscribe({
      next: () => {
        localStorage.setItem('sistema_cd', String(sistemaSeleccionado.id));
        localStorage.setItem('ultimo_sistema_cd', String(sistemaSeleccionado.id));
        localStorage.setItem('sistema_prefijo', sistemaSeleccionado.prefijo);
        localStorage.setItem('sistema_descripcion', sistemaSeleccionado.descripcion);
        this.submitting.set(false);
        this.router.navigate([rutaDestino]).then((navigated) => {
          if (navigated) {
            this.notify.success(`Bienvenido a ${sistemaSeleccionado.descripcion}.`);
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.loginError.set('No se pudo iniciar sesion. Verifica tus credenciales e intenta nuevamente.');
        console.error('Login falló:', {
          status: err?.status,
          statusText: err?.statusText,
          detalle: err?.error
        });
      }
    });
  }

  // Método para mostrar u ocultar la contraseña en el campo de entrada.
  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide()); // Cambiamos el valor del signal
    event.stopPropagation(); // Evitamos que el clic dispare otras acciones del form
  }

  cargarSistemas() {
    this.data.getEntidad('Sistemas', 'ADM').subscribe({
      next: (res) => {
        this.sistemas = res;

        const ultimoSistema = Number(
          localStorage.getItem('ultimo_sistema_cd') || localStorage.getItem('sistema_cd')
        );
        if (ultimoSistema) {
          const existe = this.sistemas.some(s => s.id === ultimoSistema && !s.icBaja);
          if (existe) {
            this.loginForm.patchValue({ idSistema: ultimoSistema });
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar sistemas:', err);
      }
    });

  }

  private getSistemaSeleccionado(): Sistema | undefined {
    const id = Number(this.loginForm.value.idSistema);
    return this.sistemas.find(s => s.id === id);
  }

  private getRutaSistema(prefijo: string): string | null {
    return getRutaSistema(this.router.config, prefijo);
  }

}