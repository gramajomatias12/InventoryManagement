import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserStore } from '../../users/user.store';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private router = inject(Router);
  hide = signal(true);

  loginForm = this.fb.group({
    dsLogin: ['', [Validators.required]],
    dsContraseña: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/usuarios']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.login(this.loginForm.value).subscribe({
        next: (res) => {
          // Si entra acá, es porque .NET devolvió Ok() con el Token
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          // Si entra acá, es porque .NET devolvió BadRequest()
          // Mostramos una alerta o dejamos que tu ErrorInterceptor haga lo suyo
          
          //alert('Usuario o contraseña incorrectos');
          console.error('Login falló:', err);
        }
      });
    }
  }

  // Método para mostrar u ocultar la contraseña en el campo de entrada.
  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide()); // Cambiamos el valor del signal
    event.stopPropagation(); // Evitamos que el clic dispare otras acciones del form
  }
}