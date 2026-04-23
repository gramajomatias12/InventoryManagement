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
  public readonly sistemas$ = this.store.sistemas$;
  public readonly perfiles$ = this.store.perfiles$;
  public readonly usuariosPerfiles$ = this.store.usuariosPerfiles$;
  public readonly perfilesRoles$ = this.store.perfilesRoles$;

  public sistemaSeleccionado: any = null;
  public perfilesAsignados: Set<number> = new Set();
  public sistemasLista: any[] = [];
  public usuariosPerfilesLista: any[] = [];
  public perfilesLista: any[] = [];
  public perfilesRolesLista: any[] = [];

  form = this.fb.group({
    cdUsuario: [0],
    dsLogin: ['', [Validators.required, Validators.minLength(4)]],
    dsPassword: ['', [Validators.minLength(4)]],
    confirmarContrasena: ['', [Validators.minLength(4)]],
    dsNombre: ['', Validators.required],
    dsApellido: ['', Validators.required],
    dsEmail: ['', [Validators.required, Validators.email]],
    icActivo: [true],
    cdSistema: [null],
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
        icActivo: !!usuario?.icActivo,
      });

      this.aplicarValidacionesPassword(false);
      if (id !== 0) {
        this.store.loadUsuariosPerfiles(id);
      }
    });

    this.usuariosPerfiles$.subscribe((list) => {
      this.usuariosPerfilesLista = Array.isArray(list) ? list : [];
      this.perfilesAsignados = new Set(list.map((up: any) => up.cdPerfil));
    });

    this.perfiles$.subscribe((list) => {
      this.perfilesLista = Array.isArray(list) ? list : [];
    });

    this.perfilesRoles$.subscribe((list) => {
      this.perfilesRolesLista = Array.isArray(list) ? list : [];
    });

    this.sistemas$.subscribe((list) => {
      this.sistemasLista = Array.isArray(list) ? list : [];
    });

    this.store.loadUsuarios();
    this.store.loadSistemas();
    this.store.loadPerfiles();
    this.store.loadPerfilesRoles();
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

  onSistemaChange(cdSistema: number): void {
    this.sistemaSeleccionado = cdSistema;
    if (cdSistema) {
      this.store.loadPerfiles(cdSistema);
    }
  }

  togglePerfilAsignado(cdPerfil: number, asignar: boolean): void {
    const cdUsuario = this.form.value.cdUsuario;
    if (!cdUsuario) return;

    if (asignar) {
      this.store.saveUsuarioPerfil(cdUsuario, cdPerfil).subscribe({
        next: () => {
          this.perfilesAsignados.add(cdPerfil);
          if (cdUsuario) {
            this.store.loadUsuariosPerfiles(Number(cdUsuario));
          }
          this.notify.success('Perfil asignado correctamente.');
        },
        error: (err) => {
          console.error('Error asignando perfil:', err);
          this.notify.error('No se pudo asignar el perfil.');
        }
      });
    } else {
      this.store.deleteUsuarioPerfil(cdUsuario, cdPerfil).subscribe({
        next: () => {
          this.perfilesAsignados.delete(cdPerfil);
          if (cdUsuario) {
            this.store.loadUsuariosPerfiles(Number(cdUsuario));
          }
          this.notify.success('Perfil desasignado correctamente.');
        },
        error: (err) => {
          console.error('Error desasignando perfil:', err);
          this.notify.error('No se pudo desasignar el perfil.');
        }
      });
    }
  }

  isPerfilAsignado(cdPerfil: number): boolean {
    return this.perfilesAsignados.has(cdPerfil);
  }

  getAccesosPorSistema(): Array<{ sistema: any; perfiles: any[] }> {
    const mapa = new Map<number, any[]>();
    const perfilesPorId = new Map<number, any>(this.perfilesLista.map((p: any) => [Number(p.cdPerfil), p]));

    for (const up of this.usuariosPerfilesLista) {
      const perfil = perfilesPorId.get(Number(up.cdPerfil));
      if (!perfil) continue;
      const cdSistema = Number(perfil.cdSistema);
      const perfiles = mapa.get(cdSistema) || [];
      perfiles.push(perfil);
      mapa.set(cdSistema, perfiles);
    }

    return Array.from(mapa.entries()).map(([cdSistema, perfiles]) => ({
      sistema: this.sistemasLista.find((s) => Number(s.id) === cdSistema),
      perfiles,
    }));
  }

  getRolesDelPerfil(cdPerfil: number): string[] {
    const relaciones = this.perfilesRolesLista.filter((pr: any) => Number(pr.cdPerfil) === Number(cdPerfil));
    return relaciones.map((pr: any) => String(pr.dsNombreRol || pr.dsRol || '').trim()).filter((r: string) => !!r);
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
