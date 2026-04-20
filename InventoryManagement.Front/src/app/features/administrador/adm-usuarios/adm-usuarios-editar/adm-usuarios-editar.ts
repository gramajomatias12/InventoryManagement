import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdministradorStore } from '../../administrador.store';
import { Loading } from '../../../../core/loading';
import { Notify } from '../../../../core/notify';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('dsPassword');
  const confirmPassword = control.get('confirmarContrasena');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordsNoMatch: true }
    : null;
};

@Component({
  selector: 'app-adm-usuarios-editar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './adm-usuarios-editar.html',
  styleUrl: './adm-usuarios-editar.scss',
})
export class AdmUsuariosEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(AdministradorStore);
  public readonly loading = inject(Loading);
  private readonly notify = inject(Notify);
  public saveError = '';

  public modoEditar = true;
  private usuarioOriginal: any = null;
  public readonly roles$ = this.store.roles$;

  form = this.fb.group({
    cdUsuario: [0],
    dsLogin: ['', [Validators.required, Validators.minLength(4)]],
    dsPassword: ['', [Validators.minLength(4)]],
    confirmarContrasena: ['', [Validators.minLength(4)]],
    dsNombre: ['', Validators.required],
    dsApellido: ['', Validators.required],
    dsEmail: ['', [Validators.required, Validators.email]],
    cdRol: [null, Validators.required],
    icActivo: [true],
  }, {
    validators: passwordsMatchValidator
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;
    this.aplicarValidacionesPassword(id === 0);

    this.store.usuarios$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const usuario = list.find((x) => this.getId(x) === id);
      if (!usuario) return;

      this.usuarioOriginal = usuario;
      this.form.patchValue({
        cdUsuario: this.getId(usuario),
        dsLogin: usuario?.dsLogin || '',
        dsPassword: '',
        confirmarContrasena: '',
        dsNombre: usuario?.dsNombre || '',
        dsApellido: usuario?.dsApellido || '',
        dsEmail: usuario?.dsEmail || '',
        cdRol: usuario?.cdRol || 0,
        icActivo: !!usuario?.icActivo,
      });

      this.aplicarValidacionesPassword(false);
    });

    this.store.loadRoles();
    this.store.loadUsuarios();
  }

  editar(): void {
    this.saveError = '';
    this.modoEditar = true;
    this.aplicarValidacionesPassword(false);
  }

  cancelar(): void {
    this.saveError = '';
    if (!this.form.value.cdUsuario) {
      this.router.navigate(['/administrador/usuarios']);
      return;
    }

    if (this.usuarioOriginal) {
      this.form.patchValue({
        cdUsuario: this.getId(this.usuarioOriginal),
        dsLogin: this.usuarioOriginal?.dsLogin || '',
        dsPassword: '',
        confirmarContrasena: '',
        dsNombre: this.usuarioOriginal?.dsNombre || '',
        dsApellido: this.usuarioOriginal?.dsApellido || '',
        dsEmail: this.usuarioOriginal?.dsEmail || '',
        cdRol: this.usuarioOriginal?.cdRol || 0,
        icActivo: !!this.usuarioOriginal?.icActivo,
      });
    }

    this.modoEditar = false;
    this.aplicarValidacionesPassword(false);
  }

  guardar(): void {
    this.saveError = '';
    this.aplicarValidacionesPassword(!this.form.value.cdUsuario);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa los campos requeridos antes de guardar el usuario.';
      return;
    }

    const raw = this.form.getRawValue();
    const payload: any = {
      cdUsuario: Number(raw.cdUsuario || 0),
      dsLogin: String(raw.dsLogin || '').trim(),
      dsNombre: String(raw.dsNombre || '').trim(),
      dsApellido: String(raw.dsApellido || '').trim(),
      dsEmail: String(raw.dsEmail || '').trim(),
      cdRol: Number(raw.cdRol || 0),
      icActivo: !!raw.icActivo,
    };

    const password = String(raw.dsPassword || '').trim();
    if (password) {
      payload.dsPassword = password;
    }

    this.store.saveUsuario(payload).subscribe({
      next: () => {
        this.router.navigate(['/administrador/usuarios']).then((navigated) => {
          if (navigated) {
            this.notify.success(raw.cdUsuario ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
          }
        });
      },
      error: (err) => {
        this.saveError = 'No se pudo guardar el usuario. Intenta nuevamente.';
        console.error('Error guardando usuario:', err);
      },
    });
  }

  getTitulo(): string {
    const nombre = `${this.form.value.dsNombre || ''} ${this.form.value.dsApellido || ''}`.trim();
    return this.form.value.cdUsuario ? (nombre || 'Usuario') : 'Nuevo Usuario';
  }

  private getId(item: any): number {
    return Number(item?.cdUsuario || item?.id || 0);
  }

  private aplicarValidacionesPassword(esNuevo: boolean): void {
    const passwordControl = this.form.get('dsPassword');
    const confirmControl = this.form.get('confirmarContrasena');

    if (esNuevo) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(4)]);
      confirmControl?.setValidators([Validators.required, Validators.minLength(4)]);
    } else {
      passwordControl?.setValidators([Validators.minLength(4)]);
      confirmControl?.setValidators([Validators.minLength(4)]);
    }

    passwordControl?.updateValueAndValidity({ emitEvent: false });
    confirmControl?.updateValueAndValidity({ emitEvent: false });
  }
}
