import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserStore } from '../users/user.store';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";
import { Data } from '../../core/data';

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
  private store = inject(UserStore);
  private router = inject(Router);
  hide = signal(true);
  public sistemas: Sistema[] = [];
  
  loginForm = this.fb.group({
    dsLogin: ['', [Validators.required]],
    dsContraseña: ['', [Validators.required, Validators.minLength(4)]],
    idSistema: [null as number | null, [Validators.required]]
  });

  constructor(private data: Data) {
    this.cargarSistemas();
   }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const prefijo = localStorage.getItem('sistema_prefijo') || 'SIS';
      this.router.navigate([this.getRutaSistema(prefijo)]);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const sistemaSeleccionado = this.getSistemaSeleccionado();

      if (!sistemaSeleccionado) {
        return;
      }

      localStorage.setItem('sistema_cd', String(sistemaSeleccionado.id));
      localStorage.setItem('sistema_prefijo', sistemaSeleccionado.prefijo);
      localStorage.setItem('sistema_descripcion', sistemaSeleccionado.descripcion);

      this.store.login(this.loginForm.value, sistemaSeleccionado.prefijo).subscribe({
        next: (res) => {
          // Entra al sistema seleccionado
          this.router.navigate([this.getRutaSistema(sistemaSeleccionado.prefijo)]);
        },
        error: (err) => {
          // Si entra acá, es porque .NET devolvió BadRequest()
          // Mostramos una alerta o dejamos que tu ErrorInterceptor haga lo suyo
          
          //alert('Usuario o contraseña incorrectos');
          console.error('Login falló:', {
            status: err?.status,
            statusText: err?.statusText,
            detalle: err?.error
          });
        }
      });
    }
  }

  // Método para mostrar u ocultar la contraseña en el campo de entrada.
  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide()); // Cambiamos el valor del signal
    event.stopPropagation(); // Evitamos que el clic dispare otras acciones del form
  }

  cargarSistemas() {
    this.data.getEntidad('Sistemas', 'SIS').subscribe({
      next: (res) => {
        this.sistemas = res;

        const ultimoSistema = Number(localStorage.getItem('sistema_cd'));
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

  private getRutaSistema(prefijo: string): string {
    switch ((prefijo || '').toUpperCase()) {
      case 'PAT':
        return '/patrimonio';
      case 'ADM':
        return '/administrador';
      default:
        return '/home';
    }
  }
  
}