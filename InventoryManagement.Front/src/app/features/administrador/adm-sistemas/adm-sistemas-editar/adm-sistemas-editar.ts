import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-adm-sistemas-editar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './adm-sistemas-editar.html',
  styleUrl: './adm-sistemas-editar.scss',
})
export class AdmSistemasEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(AdministradorStore);
  public readonly loading = inject(Loading);
  private readonly notify = inject(Notify);
  public saveError = '';
  public rolNuevo = '';
  public rolNombreNuevo = '';
  public rolDescripcionNueva = '';
  public perfilNuevo = '';
  public perfilDescripcionNueva = '';
  public rolSeleccionadoParaPerfil: number | null = null;

  public modoEditar = true;
  private sistemaOriginal: any = null;
  public readonly rolesAdm$ = this.store.rolesAdm$;
  public readonly perfiles$ = this.store.perfiles$;
  public readonly perfilesRoles$ = this.store.perfilesRoles$;
  public rolesSistema: any[] = [];
  public perfilesSistema: any[] = [];
  public perfilesRolesSistema: any[] = [];

  form = this.fb.group({
    id: [0],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    prefijo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    icBaja: [false],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.modoEditar = id === 0;

    this.store.sistemas$.subscribe((list) => {
      if (!list || list.length === 0) return;
      if (id === 0) return;

      const sistema = list.find((x) => this.getId(x) === id);
      if (!sistema) return;

      this.sistemaOriginal = sistema;
      this.form.patchValue({
        id: this.getId(sistema),
        descripcion: this.getNombre(sistema),
        prefijo: this.getPrefijo(sistema),
        icBaja: !!sistema?.icBaja,
      });

      this.cargarSeguridadSistema(this.getId(sistema));
    });

    this.rolesAdm$.subscribe((list) => {
      this.rolesSistema = Array.isArray(list) ? list : [];
    });
    this.perfiles$.subscribe((list) => {
      this.perfilesSistema = Array.isArray(list) ? list : [];
    });
    this.perfilesRoles$.subscribe((list) => {
      this.perfilesRolesSistema = Array.isArray(list) ? list : [];
    });

    this.store.loadSistemas();
  }

  editar(): void {
    this.saveError = '';
    this.modoEditar = true;
  }

  cancelar(): void {
    this.saveError = '';
    if (!this.form.value.id) {
      this.router.navigate(['/administrador/sistemas']);
      return;
    }

    if (this.sistemaOriginal) {
      this.form.patchValue({
        id: this.getId(this.sistemaOriginal),
        descripcion: this.getNombre(this.sistemaOriginal),
        prefijo: this.getPrefijo(this.sistemaOriginal),
        icBaja: !!this.sistemaOriginal?.icBaja,
      });
    }

    this.modoEditar = false;
  }

  guardar(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = 'Revisa la descripcion y el prefijo antes de guardar el sistema.';
      return;
    }

    const payload = {
      id: Number(this.form.value.id || 0),
      descripcion: String(this.form.value.descripcion || '').trim(),
      prefijo: this.getPrefijo(this.form.value),
      icBaja: !!this.form.value.icBaja,
    };

    this.store.saveSistema(payload).subscribe({
      next: () => {
        this.router.navigate(['/administrador/sistemas']).then((navigated) => {
          if (navigated) {
            this.notify.success(payload.id ? 'Sistema actualizado correctamente.' : 'Sistema creado correctamente.');
          }
        });
      },
      error: (err) => {
        this.saveError = 'No se pudo guardar el sistema. Intenta nuevamente.';
        console.error('Error guardando sistema:', err);
      },
    });
  }

  getTitulo(): string {
    return this.form.value.id ? String(this.form.value.descripcion || 'Sistema') : 'Nuevo Sistema';
  }

  agregarRol(): void {
    const cdSistema = Number(this.form.value.id || 0);
    if (!cdSistema || !this.rolNuevo.trim()) return;

    this.store.saveRol({
      dsRol: this.rolNuevo.trim(),
      dsNombre: (this.rolNombreNuevo || this.rolNuevo).trim(),
      dsDescripcion: this.rolDescripcionNueva?.trim() || undefined,
      cdSistema,
      icBorrado: false,
    }).subscribe({
      next: () => {
        this.rolNuevo = '';
        this.rolNombreNuevo = '';
        this.rolDescripcionNueva = '';
        this.cargarSeguridadSistema(cdSistema);
        this.notify.success('Rol agregado correctamente.');
      },
      error: (err) => {
        console.error('Error agregando rol:', err);
        this.notify.error('No se pudo agregar el rol.');
      }
    });
  }

  agregarPerfil(): void {
    const cdSistema = Number(this.form.value.id || 0);
    if (!cdSistema || !this.perfilNuevo.trim()) return;

    this.store.savePerfil({
      dsPerfil: this.perfilNuevo.trim(),
      dsDescripcion: this.perfilDescripcionNueva?.trim() || undefined,
      cdSistema,
      icBorrado: false,
    }).subscribe({
      next: () => {
        this.perfilNuevo = '';
        this.perfilDescripcionNueva = '';
        this.cargarSeguridadSistema(cdSistema);
        this.notify.success('Perfil agregado correctamente.');
      },
      error: (err) => {
        console.error('Error agregando perfil:', err);
        this.notify.error('No se pudo agregar el perfil.');
      }
    });
  }

  vincularRolPerfil(cdPerfil: number): void {
    const cdRol = Number(this.rolSeleccionadoParaPerfil || 0);
    const cdSistema = Number(this.form.value.id || 0);
    if (!cdPerfil || !cdRol || !cdSistema) return;

    this.store.savePerfilRol(cdPerfil, cdRol).subscribe({
      next: () => {
        this.cargarSeguridadSistema(cdSistema);
        this.notify.success('Rol vinculado al perfil.');
      },
      error: (err) => {
        console.error('Error vinculando rol a perfil:', err);
        this.notify.error('No se pudo vincular el rol al perfil.');
      }
    });
  }

  getRolesDelPerfil(cdPerfil: number): string[] {
    return this.perfilesRolesSistema
      .filter((x: any) => Number(x.cdPerfil) === Number(cdPerfil))
      .map((x: any) => String(x.dsNombreRol || x.dsRol || '').trim())
      .filter((x: string) => !!x);
  }

  private cargarSeguridadSistema(cdSistema: number): void {
    this.store.loadRolesAdm(cdSistema);
    this.store.loadPerfiles(cdSistema);
    this.store.loadPerfilesRoles(cdSistema);
  }

  private getId(item: any): number {
    return Number(item?.id || item?.cdSistema || 0);
  }

  private getNombre(item: any): string {
    return item?.descripcion || item?.dsSistema || item?.nombre || '';
  }

  private getPrefijo(item: any): string {
    return String(item?.prefijo || item?.dsPrefijo || '').trim().toUpperCase();
  }
}
